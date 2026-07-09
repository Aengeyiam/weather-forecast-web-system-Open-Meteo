<?php
/**
 * 天气预报网页系统 - 用户注册接口
 * 作者：熊倡
 * 
 * 请求方式：POST
 * 请求参数：username (string), password (string)
 * 返回格式：JSON
 */

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => '请求方式错误'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$username = trim($input['username'] ?? '');
$password = $input['password'] ?? '';

if ($username === '' || $password === '') {
    jsonResponse([
        'success' => false,
        'message' => '请输入用户名和密码'
    ]);
}

if (mb_strlen($username) < 2 || mb_strlen($username) > 50) {
    jsonResponse([
        'success' => false,
        'message' => '用户名长度需在2-50个字符之间'
    ]);
}

if (mb_strlen($password) < 6) {
    jsonResponse([
        'success' => false,
        'message' => '密码长度不能少于6位'
    ]);
}

$pdo = getDBConnection();

$stmt = $pdo->prepare('SELECT user_id FROM `user` WHERE username = ?');
$stmt->execute([$username]);

if ($stmt->fetch()) {
    jsonResponse([
        'success' => false,
        'message' => '该用户名已被注册，请更换'
    ]);
}

$stmt = $pdo->prepare('INSERT INTO `user` (username, password) VALUES (?, SHA2(?, 256))');
$stmt->execute([$username, $password]);

jsonResponse([
    'success'  => true,
    'message'  => '注册成功',
    'user_id'  => (int)$pdo->lastInsertId(),
    'username' => $username
]);
