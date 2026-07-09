<?php
/**
 * 天气预报网页系统 - 数据库配置
 * 作者：熊倡
 */

// ========== 数据库连接参数（修改为你的实际配置）==========
$DB_HOST = 'localhost';
$DB_PORT = '3306';
$DB_NAME = 'weather_system';
$DB_USER = 'root';
$DB_PASSWORD = '';

// ========== 创建 PDO 连接 ==========
function getDB() {
    global $DB_HOST, $DB_PORT, $DB_NAME, $DB_USER, $DB_PASSWORD;
    try {
        $dsn = "mysql:host={$DB_HOST};port={$DB_PORT};dbname={$DB_NAME};charset=utf8mb4";
        $pdo = new PDO($dsn, $DB_USER, $DB_PASSWORD, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => '数据库连接失败: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// ========== 通用响应 ==========
function jsonResponse($data, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// ========== 读取请求体 JSON ==========
function getJsonInput() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?: [];
}
