<?php
/**
 * 天气预报网页系统 - 退出登录接口
 */
session_start();
session_destroy();
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['success' => true, 'message' => '已退出登录'], JSON_UNESCAPED_UNICODE);
