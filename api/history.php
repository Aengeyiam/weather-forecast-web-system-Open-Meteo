<?php
/**
 * 天气预报网页系统 - 历史记录接口
 * 作者：熊倡
 * 
 * GET  /api/history.php?action=list   — 获取当前用户历史记录
 * POST /api/history.php               — 保存查询记录
 * 
 * 返回格式：JSON
 */

require_once __DIR__ . '/config.php';

// 启动会话，获取登录用户
session_start();

// 检查登录态
if (!isset($_SESSION['user_id'])) {
    jsonResponse(['success' => false, 'message' => '请先登录'], 401);
}

$userId = $_SESSION['user_id'];
$pdo = getDBConnection();

// ---------- GET：获取历史记录 ----------
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = $_GET['action'] ?? 'list';
    
    if ($action === 'list') {
        $stmt = $pdo->prepare(
            'SELECT record_id, query_city, query_time 
             FROM weather_history 
             WHERE user_id = ? 
             ORDER BY query_time DESC 
             LIMIT 50'
        );
        $stmt->execute([$userId]);
        $records = $stmt->fetchAll();
        
        jsonResponse([
            'success' => true,
            'data'    => $records
        ]);
    }
}

// ---------- POST：保存查询记录 ----------
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $city = trim($input['city'] ?? '');
    
    if ($city === '') {
        jsonResponse(['success' => false, 'message' => '城市名不能为空']);
    }
    
    $stmt = $pdo->prepare(
        'INSERT INTO weather_history (user_id, query_city) VALUES (?, ?)'
    );
    $stmt->execute([$userId, $city]);
    
    jsonResponse([
        'success'  => true,
        'recordId' => (int)$pdo->lastInsertId()
    ]);
}

// 其他请求方式
jsonResponse(['success' => false, 'message' => '请求方式错误'], 405);
