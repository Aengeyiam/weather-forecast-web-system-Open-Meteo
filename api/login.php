<?php
/**
 * 天气预报网页系统 - 登录接口
 * 作者：熊倡
 */
require_once __DIR__ . '/config.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { jsonResponse(['success' => false, 'message' => '仅支持POST请求'], 405); }

$input = getJsonInput();
$username = trim($input['username'] ?? '');
$password = $input['password'] ?? '';

if (!$username || !$password) {
    jsonResponse(['success' => false, 'message' => '请输入用户名和密码'], 400);
}

$pdo = getDB();
$stmt = $pdo->prepare('SELECT user_id, username, password FROM user WHERE username = ?');
$stmt->execute([$username]);
$user = $stmt->fetch();

if (!$user || $user['password'] !== hash('sha256', $password)) {
    jsonResponse(['success' => false, 'message' => '用户名或密码错误'], 401);
}

jsonResponse(['success' => true, 'userId' => (int)$user['user_id'], 'username' => $user['username']]);
