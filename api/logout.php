<?php
/**
 * 天气预报网页系统 - 退出登录接口
 * 作者：熊倡
 * 
 * 请求方式：POST
 * 返回格式：JSON
 * 功能：销毁当前用户的登录会话
 */

// 仅在 session 未启动时启动，避免重复启动的警告
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// 清除 session 中的所有数据
$_SESSION = [];

// 销毁 session cookie
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params['path'],
        $params['domain'],
        $params['secure'],
        $params['httponly']
    );
}

// 销毁 session
session_destroy();

header('Content-Type: application/json; charset=utf-8');
echo json_encode(['success' => true, 'message' => '已退出登录'], JSON_UNESCAPED_UNICODE);
