<?php
/**
 * 天气预报网页系统 - 注册接口
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
    jsonResponse(['success' => false, 'message' => '用户名和密码不能为空'], 400);
}
if (mb_strlen($username) < 2 || mb_strlen($username) > 50) {
    jsonResponse(['success' => false, 'message' => '用户名长度需在2-50个字符之间'], 400);
}
if (strlen($password) < 6) {
    jsonResponse(['success' => false, 'message' => '密码长度不能少于6位'], 400);
}

$pdo = getDB();
try {
    $stmt = $pdo->prepare('INSERT INTO user (username, password) VALUES (?, ?)');
    $stmt->execute([$username, hash('sha256', $password)]);
    $userId = (int)$pdo->lastInsertId();
    jsonResponse(['success' => true, 'userId' => $userId, 'username' => $username, 'message' => '注册成功，请登录'], 201);
} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        jsonResponse(['success' => false, 'message' => '用户名已存在，请换一个'], 409);
    }
    jsonResponse(['success' => false, 'message' => '注册失败，请稍后重试'], 500);
}
