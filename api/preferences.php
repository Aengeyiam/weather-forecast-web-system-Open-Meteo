<?php
/**
 * 天气预报网页系统 - 用户偏好/收藏/预警接口
 */
require_once __DIR__ . '/config.php';
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
if (!isset($_SESSION['user_id'])) {
    jsonResponse(['success' => false, 'message' => '请先登录'], 401);
}
$userId = (int)$_SESSION['user_id'];
$pdo = getDBConnection();

function ensurePreferenceTables($pdo) {
    $pdo->exec("CREATE TABLE IF NOT EXISTS `favorite_city` (
        `favorite_id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '收藏ID',
        `user_id` INT(11) NOT NULL COMMENT '用户ID',
        `city_name` VARCHAR(100) NOT NULL COMMENT '城市名称',
        `lat` DECIMAL(10,6) DEFAULT NULL COMMENT '纬度',
        `lon` DECIMAL(10,6) DEFAULT NULL COMMENT '经度',
        `is_default` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否默认城市',
        `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        PRIMARY KEY (`favorite_id`),
        UNIQUE KEY `uk_user_city` (`user_id`, `city_name`),
        KEY `idx_favorite_user` (`user_id`),
        CONSTRAINT `fk_favorite_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收藏城市表'");

    $pdo->exec("CREATE TABLE IF NOT EXISTS `user_preference` (
        `user_id` INT(11) NOT NULL COMMENT '用户ID',
        `profile_type` VARCHAR(30) NOT NULL DEFAULT 'student' COMMENT '用户身份类型',
        `alerts_enabled` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否开启预警',
        `high_temp` INT(11) NOT NULL DEFAULT 35 COMMENT '高温阈值',
        `low_temp` INT(11) NOT NULL DEFAULT 5 COMMENT '低温阈值',
        `rain_prob` INT(11) NOT NULL DEFAULT 50 COMMENT '降雨概率阈值',
        `wind_speed` INT(11) NOT NULL DEFAULT 30 COMMENT '风速阈值',
        `uv_index` INT(11) NOT NULL DEFAULT 8 COMMENT '紫外线阈值',
        `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        PRIMARY KEY (`user_id`),
        CONSTRAINT `fk_preference_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户偏好与预警阈值表'");
}

function getFavorites($pdo, $userId) {
    $stmt = $pdo->prepare('SELECT favorite_id, city_name, lat, lon, is_default, created_at FROM favorite_city WHERE user_id = ? ORDER BY is_default DESC, created_at DESC');
    $stmt->execute([$userId]);
    return $stmt->fetchAll();
}

function getPreferences($pdo, $userId) {
    $stmt = $pdo->prepare('SELECT profile_type, alerts_enabled, high_temp, low_temp, rain_prob, wind_speed, uv_index FROM user_preference WHERE user_id = ?');
    $stmt->execute([$userId]);
    $pref = $stmt->fetch();
    if (!$pref) {
        $stmt = $pdo->prepare('INSERT INTO user_preference (user_id) VALUES (?)');
        $stmt->execute([$userId]);
        return [
            'profile_type' => 'student', 'alerts_enabled' => 1, 'high_temp' => 35, 'low_temp' => 5,
            'rain_prob' => 50, 'wind_speed' => 30, 'uv_index' => 8
        ];
    }
    return $pref;
}

ensurePreferenceTables($pdo);
$action = $_GET['action'] ?? 'all';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'all') {
        jsonResponse(['success' => true, 'favorites' => getFavorites($pdo, $userId), 'preferences' => getPreferences($pdo, $userId)]);
    }
    if ($action === 'favorites') {
        jsonResponse(['success' => true, 'favorites' => getFavorites($pdo, $userId)]);
    }
    if ($action === 'preferences') {
        jsonResponse(['success' => true, 'preferences' => getPreferences($pdo, $userId)]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];

    if ($action === 'add_favorite') {
        $city = trim($input['city_name'] ?? '');
        if ($city === '') jsonResponse(['success' => false, 'message' => '城市名不能为空']);
        $isDefault = !empty($input['is_default']) ? 1 : 0;
        if ($isDefault) {
            $stmt = $pdo->prepare('UPDATE favorite_city SET is_default = 0 WHERE user_id = ?');
            $stmt->execute([$userId]);
        }
        $stmt = $pdo->prepare('INSERT INTO favorite_city (user_id, city_name, lat, lon, is_default) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE lat = VALUES(lat), lon = VALUES(lon), is_default = IF(VALUES(is_default)=1, 1, is_default)');
        $stmt->execute([$userId, $city, $input['lat'] ?? null, $input['lon'] ?? null, $isDefault]);
        jsonResponse(['success' => true, 'favorites' => getFavorites($pdo, $userId)]);
    }

    if ($action === 'remove_favorite') {
        $city = trim($input['city_name'] ?? '');
        $stmt = $pdo->prepare('DELETE FROM favorite_city WHERE user_id = ? AND city_name = ?');
        $stmt->execute([$userId, $city]);
        jsonResponse(['success' => true, 'favorites' => getFavorites($pdo, $userId)]);
    }

    if ($action === 'set_default') {
        $city = trim($input['city_name'] ?? '');
        if ($city === '') jsonResponse(['success' => false, 'message' => '城市名不能为空']);
        $pdo->beginTransaction();
        $stmt = $pdo->prepare('UPDATE favorite_city SET is_default = 0 WHERE user_id = ?');
        $stmt->execute([$userId]);
        $stmt = $pdo->prepare('UPDATE favorite_city SET is_default = 1 WHERE user_id = ? AND city_name = ?');
        $stmt->execute([$userId, $city]);
        $pdo->commit();
        jsonResponse(['success' => true, 'favorites' => getFavorites($pdo, $userId)]);
    }

    if ($action === 'update_preferences') {
        $profile = $input['profile_type'] ?? 'student';
        $allowed = ['student','worker','elder','outdoor','driver'];
        if (!in_array($profile, $allowed, true)) $profile = 'student';
        $stmt = $pdo->prepare('REPLACE INTO user_preference (user_id, profile_type, alerts_enabled, high_temp, low_temp, rain_prob, wind_speed, uv_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $userId,
            $profile,
            !empty($input['alerts_enabled']) ? 1 : 0,
            (int)($input['high_temp'] ?? 35),
            (int)($input['low_temp'] ?? 5),
            (int)($input['rain_prob'] ?? 50),
            (int)($input['wind_speed'] ?? 30),
            (int)($input['uv_index'] ?? 8)
        ]);
        jsonResponse(['success' => true, 'preferences' => getPreferences($pdo, $userId)]);
    }
}

jsonResponse(['success' => false, 'message' => '请求方式或参数错误'], 405);
