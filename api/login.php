<?php
/**
 * 天气预报网页系统 - 用户登录接口
 * 作者：熊倡
 * 
 * 请求方式：POST
 * 请求参数：username (string), password (string)
 * 返回格式：JSON
 */

require_once __DIR__ . '/config.php';

// 只接受 POST 请求
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => '请求方式错误'], 405);
}

// 获取请求参数
$input = json_decode(file_get_contents('php://input'), true);
$username = trim($input['username'] ?? '');
$password = $input['password'] ?? '';

// ---------- 表单验证 ----------

// 用户名为空
if ($username === '') {
    jsonResponse([
        'success' => false,
        'message' => '请输入用户名和密码'
    ]);
}

// 密码为空
if ($password === '') {
    jsonResponse([
        'success' => false,
        'message' => '请输入用户名和密码'
    ]);
}

// ---------- 数据库校验 ----------

$pdo = getDBConnection();

// 查询用户（密码使用 SHA-256 加密比对）
$stmt = $pdo->prepare('SELECT user_id, username FROM `user` WHERE username = ? AND password = SHA2(?, 256)');
$stmt->execute([$username, $password]);
$user = $stmt->fetch();

if ($user) {
    // 登录成功 - 启动会话
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    // 重新生成 session ID，防止 session 固定攻击
    session_regenerate_id(true);
    $_SESSION['user_id'] = $user['user_id'];
    $_SESSION['username'] = $user['username'];
    
    jsonResponse([
        'success'  => true,
        'message'  => '登录成功',
        'user_id'  => $user['user_id'],
        'username' => $user['username']
    ]);
} else {
    // 先查用户名是否存在（用于区分"用户不存在"和"密码错误"）
    $stmtCheck = $pdo->prepare('SELECT user_id FROM `user` WHERE username = ?');
    $stmtCheck->execute([$username]);
    
    // 安全考虑：不论用户名不存在还是密码错误，统一返回相同提示
    jsonResponse([
        'success' => false,
        'message' => '用户名或密码错误'
    ]);
}
