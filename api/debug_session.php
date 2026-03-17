<?php
header('Access-Control-Allow-Origin: https://campus-dive.vercel.app');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'domain'   => '',
        'secure'   => true,
        'httponly' => true,
        'samesite' => 'None',
    ]);
    session_start();
}

echo json_encode([
    'session_id' => session_id(),
    'session_data' => $_SESSION,
    'cookie_params' => session_get_cookie_params(),
    'headers' => getallheaders(),
    'server' => [
        'HTTPS' => $_SERVER['HTTPS'] ?? 'not set',
        'HTTP_X_FORWARDED_PROTO' => $_SERVER['HTTP_X_FORWARDED_PROTO'] ?? 'not set',
    ]
]);
?>
