<?php
/**
 * 天气预报网页系统 - 数据库配置文件
 * 作者：熊倡
 * 
 * 使用说明：
 * 1. 修改 $db_host, $db_user, $db_pass 为你的 MySQL 配置
 * 2. 确保 MySQL 服务已启动
 * 3. 确保已执行 sql/init.sql 初始化数据库
 */

// 数据库连接配置
$db_host = 'localhost';      // 数据库主机地址
$db_port = 3306;             // 数据库端口
$db_name = 'weather_system'; // 数据库名称
$db_user = 'root';           // 数据库用户名
$db_pass = '';               // 数据库密码（请修改为实际密码）
$db_charset = 'utf8mb4';     // 数据库字符集

/**
 * 获取数据库连接（PDO）
 * @return PDO 数据库连接对象
 */
function getDBConnection() {
    global $db_host, $db_port, $db_name, $db_user, $db_pass, $db_charset;
    
    $dsn = "mysql:host={$db_host};port={$db_port};dbname={$db_name};charset={$db_charset}";
    
    try {
        $pdo = new PDO($dsn, $db_user, $db_pass, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => '数据库连接失败，请联系管理员'
        ]);
        exit;
    }
}

/**
 * 返回 JSON 响应
 * @param array $data 响应数据
 * @param int   $code HTTP 状态码
 */
function jsonResponse($data, $code = 200) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
