<?php
/**
 * 天气预报网页系统 - 历史记录接口（增强版）
 */
require_once __DIR__ . '/config.php';
session_start();
if (!isset($_SESSION['user_id'])) {
    jsonResponse(['success' => false, 'message' => '请先登录'], 401);
}
$userId = (int)$_SESSION['user_id'];
$pdo = getDBConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = $_GET['action'] ?? 'list';
    if ($action === 'list') {
        $stmt = $pdo->prepare('SELECT record_id, query_city, query_time FROM weather_history WHERE user_id = ? ORDER BY query_time DESC LIMIT 80');
        $stmt->execute([$userId]);
        jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
    }
    if ($action === 'stats') {
        $stmt = $pdo->prepare('SELECT COUNT(*) AS total FROM weather_history WHERE user_id = ?');
        $stmt->execute([$userId]);
        $total = (int)$stmt->fetch()['total'];
        $stmt = $pdo->prepare('SELECT query_city, COUNT(*) AS times FROM weather_history WHERE user_id = ? GROUP BY query_city ORDER BY times DESC, MAX(query_time) DESC LIMIT 5');
        $stmt->execute([$userId]);
        jsonResponse(['success' => true, 'total' => $total, 'top_cities' => $stmt->fetchAll()]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $city = trim($input['city'] ?? '');
    if ($city === '') {
        jsonResponse(['success' => false, 'message' => '城市名不能为空']);
    }
    $stmt = $pdo->prepare('INSERT INTO weather_history (user_id, query_city) VALUES (?, ?)');
    $stmt->execute([$userId, $city]);
    jsonResponse(['success' => true, 'recordId' => (int)$pdo->lastInsertId()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $action = $_GET['action'] ?? '';
    if ($action === 'delete') {
        $id = (int)($_GET['id'] ?? 0);
        if ($id <= 0) jsonResponse(['success' => false, 'message' => '记录ID无效']);
        $stmt = $pdo->prepare('DELETE FROM weather_history WHERE user_id = ? AND record_id = ?');
        $stmt->execute([$userId, $id]);
        jsonResponse(['success' => true]);
    }
    if ($action === 'clear') {
        $stmt = $pdo->prepare('DELETE FROM weather_history WHERE user_id = ?');
        $stmt->execute([$userId]);
        jsonResponse(['success' => true]);
    }
}

jsonResponse(['success' => false, 'message' => '请求方式错误'], 405);
