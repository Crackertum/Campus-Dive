<?php
ob_start(); // ← OUTPUT BUFFERING - MUST BE FIRST LINE

// 1. Error handling & Shutdown (Register as early as possible)
error_reporting(E_ALL);
ini_set('display_errors', 0);

register_shutdown_function(function () {
    $error = error_get_last();
    if ($error !== NULL && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        if (ob_get_length()) ob_clean();
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Fatal Error (Shutdown): ' . $error['message'],
            'file'    => defined('APP_DEBUG') && APP_DEBUG ? $error['file'] : null,
            'line'    => defined('APP_DEBUG') && APP_DEBUG ? $error['line'] : null,
        ]);
        exit;
    }
});

set_exception_handler(function (Throwable $e) {
    if (ob_get_length()) ob_clean(); 
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Uncaught Exception: ' . $e->getMessage(),
        'file'    => defined('APP_DEBUG') && APP_DEBUG ? $e->getFile() : null,
        'line'    => defined('APP_DEBUG') && APP_DEBUG ? $e->getLine() : null,
    ]);
    exit;
});

/**
 * Campus Dive API — Front Controller / Router
 */

// 2. CORS & Preflight

// Session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Load framework
require_once __DIR__ . '/config/app.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/helpers/Response.php';
require_once __DIR__ . '/helpers/Validator.php';

// Middleware
require_once __DIR__ . '/middleware/AuthMiddleware.php';
require_once __DIR__ . '/middleware/RoleMiddleware.php';
require_once __DIR__ . '/middleware/CsrfMiddleware.php';

// Models
require_once __DIR__ . '/models/User.php';
require_once __DIR__ . '/models/Document.php';
require_once __DIR__ . '/models/Message.php';
require_once __DIR__ . '/models/Notification.php';
require_once __DIR__ . '/models/Role.php';

// Services
require_once __DIR__ . '/services/EmailService.php';
require_once __DIR__ . '/services/FileService.php';

// Controllers
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/StudentController.php';
require_once __DIR__ . '/controllers/AdminController.php';
require_once __DIR__ . '/controllers/MessageController.php';
require_once __DIR__ . '/controllers/NotificationController.php';

// Parse route
$requestUri = $_SERVER['REQUEST_URI'];
$scriptName = $_SERVER['SCRIPT_NAME'];
$basePath = str_replace('/index.php', '', $scriptName);
$path = parse_url($requestUri, PHP_URL_PATH);

if (strpos($path, $basePath) === 0) {
    $path = substr($path, strlen($basePath));
}
$path = rtrim($path, '/') ?: '/';
$method = $_SERVER['REQUEST_METHOD'];

// ────────────────────────────────────────────
// Route Definitions
// ────────────────────────────────────────────

$routes = [
    // Auth (public)
    'POST /auth/login'           => ['AuthController', 'login'],
    'POST /auth/register'        => ['AuthController', 'register'],
    'GET  /auth/verify-email'    => ['AuthController', 'verifyEmail'],
    'POST /auth/forgot-password' => ['AuthController', 'forgotPassword'],
    'POST /auth/reset-password'  => ['AuthController', 'resetPassword'],
    'GET  /auth/me'              => ['AuthController', 'me'],
    'POST /auth/logout'          => ['AuthController', 'logout'],
    'GET  /auth/csrf'            => function() {
        if (session_status() === PHP_SESSION_NONE) session_start();
        Response::success(['csrf_token' => CsrfMiddleware::getToken()]);
    },

    // Student
    'GET  /student/dashboard'    => ['StudentController', 'dashboard'],
    'GET  /student/documents'    => ['StudentController', 'documents'],
    'POST /student/documents'    => ['StudentController', 'uploadDocument'],
    'PUT  /student/profile'      => ['StudentController', 'updateProfile'],
    'PUT  /student/password'     => ['StudentController', 'changePassword'],
    'POST /student/avatar'       => ['StudentController', 'uploadAvatar'],

    // Admin
    'GET  /admin/dashboard'      => ['AdminController', 'dashboard'],
    'GET  /admin/students'       => ['AdminController', 'students'],
    'POST /admin/students/bulk-action' => ['AdminController', 'bulkAction'],
    'GET  /admin/roles'          => ['AdminController', 'roles'],

    // Messages
    'GET  /messages/conversations'  => ['MessageController', 'conversations'],
    'POST /messages'                => ['MessageController', 'send'],
    'GET  /messages/unread-count'   => ['MessageController', 'unreadCount'],

    // Notifications
    'GET  /notifications'           => ['NotificationController', 'index'],
    'PUT  /notifications/read-all'  => ['NotificationController', 'markAllRead'],
    'GET  /notifications/unread-count' => ['NotificationController', 'unreadCount'],

    // Logs (Debug Only)
    'GET  /logs/emails' => function() {
        if (!defined('APP_DEBUG') || !APP_DEBUG) {
            Response::error('Logs only accessible in debug mode.', 403);
        }
        $logFile = __DIR__ . '/logs/email_errors.log';
        if (!file_exists($logFile)) {
            Response::success(['logs' => 'No logs found yet.'], 'No email error logs available.');
        }
        $content = file_get_contents($logFile);
        echo "<pre>$content</pre>";
        exit;
    },
];

// Parameterized routes (with :id)
$paramRoutes = [
    'DELETE /student/documents/:id'     => ['StudentController', 'deleteDocument'],
    'GET    /admin/students/:id'        => ['AdminController', 'studentDetail'],
    'PUT    /admin/students/:id/status' => ['AdminController', 'updateStudentStatus'],
    'PUT    /admin/roles/:id'           => ['AdminController', 'updateRole'],
    'GET    /messages/thread/:id'       => ['MessageController', 'thread'],
    'PUT    /messages/:id/read'         => ['MessageController', 'markRead'],
    'PUT    /notifications/:id/read'    => ['NotificationController', 'markRead'],
];

// ────────────────────────────────────────────
// Route Matching
// ────────────────────────────────────────────

// 1. Check exact routes
foreach ($routes as $pattern => $handler) {
    $patternMethod = trim(explode(' ', trim($pattern))[0]);
    $patternPath = trim(explode(' ', trim($pattern), 2)[1]);

    if ($patternMethod === $method && $patternPath === $path) {
        if (is_callable($handler)) {
            $handler();
        } else {
            [$class, $action] = $handler;
            $class::$action();
        }
        exit;
    }
}

// 2. Check parameterized routes
foreach ($paramRoutes as $pattern => $handler) {
    $parts = preg_split('/\s+/', trim($pattern), 2);
    $patternMethod = $parts[0];
    $patternPath = $parts[1];

    if ($patternMethod !== $method) continue;

    $regex = preg_replace('#:(\w+)#', '(\d+)', $patternPath);
    $regex = '#^' . $regex . '$#';

    if (preg_match($regex, $path, $matches)) {
        array_shift($matches);
        [$class, $action] = $handler;
        $class::$action(...array_map('intval', $matches));
        exit;
    }
}

// 3. Root info
if ($path === '/' || $path === '') {
    Response::success([
        'app'     => APP_NAME,
        'version' => '2.0.0',
        'status'  => 'running',
    ], 'Campus Dive API is running.');
    exit;
}

// 4. Not found
Response::notFound('Route not found: ' . $method . ' ' . $path);