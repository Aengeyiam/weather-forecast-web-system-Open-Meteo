<?php
require_once __DIR__ . '/config.php';
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
if (isset($_SESSION['user_id'])) {
    jsonResponse([
        'success' => true,
        'logged_in' => true,
        'user_id' => (int)$_SESSION['user_id'],
        'username' => $_SESSION['username'] ?? ''
    ]);
}
jsonResponse(['success' => true, 'logged_in' => false]);
