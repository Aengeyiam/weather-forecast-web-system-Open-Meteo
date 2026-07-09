<?php
/**
 * 天气预报网页系统 - 历史记录接口
 * GET  ?userId=X      → 查询历史
 * POST {userId, city} → 新增记录
 * 作者：熊倡
 */
require_once __DIR__ . '/config.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $userId = $_GET['userId'] ?? '';
    if (!$userId || !ctype_digit($userId)) {
        jsonResponse(['success' => true, 'records' => []]);
    }
    $pdo = getDB();
    $stmt = $pdo->prepare(
        'SELECT record_id, query_city, query_time FROM weather_history WHERE user_id = ? ORDER BY query_time DESC LIMIT 100'
    );
    $stmt->execute([(int)$userId]);
    $records = $stmt->fetchAll();
    $result = array_map(function($r) {
        return ['recordId' => (int)$r['record_id'], 'queryCity' => $r['query_city'], 'queryTime' => $r['query_time']];
    }, $records);
    jsonResponse(['success' => true, 'records' => $result]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = getJsonInput();
    $userId = $input['userId'] ?? '';
    $city = trim($input['city'] ?? '');
    if (!$userId || !$city) {
        jsonResponse(['success' => false, 'message' => '参数不完整'], 400);
    }
    $pdo = getDB();
    $stmt = $pdo->prepare('INSERT INTO weather_history (user_id, query_city) VALUES (?, ?)');
    $stmt->execute([(int)$userId, $city]);
    jsonResponse(['success' => true, 'recordId' => (int)$pdo->lastInsertId()], 201);
}

jsonResponse(['success' => false, 'message' => '不支持的请求方法'], 405);
