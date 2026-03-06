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
$envOrigin = getenv('CORS_ORIGIN') ?: 'http://localhost:5173,https://campus-dive.vercel.app';
$allowedOrigins = array_map('trim', explode(',', $envOrigin));
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} elseif (empty($origin)) {
    header("Access-Control-Allow-Origin: *");
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

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
require_once __DIR__ . '/models/ApplicationStage.php';
require_once __DIR__ . '/models/InterviewSlot.php';
require_once __DIR__ . '/models/Permission.php';
require_once __DIR__ . '/models/MarketingTemplate.php';
require_once __DIR__ . '/models/MarketingCampaign.php';
require_once __DIR__ . '/models/MarketingQueue.php';
require_once __DIR__ . '/models/DocumentVersion.php';
require_once __DIR__ . '/models/DocumentContent.php';
require_once __DIR__ . '/models/RecruitmentLetter.php';
require_once __DIR__ . '/models/Analytics.php';

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

        $content = file_get_contents($logFile);
        echo "<pre>$content</pre>";
        exit;
    },

    // Debug DB Inspector
    'GET /debug/db' => function() {
        if (!defined('APP_DEBUG') || !APP_DEBUG) {
            Response::error('Debug info only accessible in debug mode.', 403);
        }
        
        try {
            $db = Database::getInstance();
            $roles = $db->query("SELECT * FROM roles")->fetchAll();
            $userStats = $db->query("SELECT role, role_id, status, COUNT(*) as count FROM users GROUP BY role, role_id, status")->fetchAll();
            $samples = $db->query("SELECT id, firstname, lastname, email, role, role_id, status FROM users ORDER BY id DESC LIMIT 5")->fetchAll();
            
            Response::success([
                'constants' => [
                    'ROLE_STUDENT' => ROLE_STUDENT,
                    'STATUS_SUBMITTED' => STATUS_SUBMITTED
                ],
                'roles_table' => $roles,
                'user_stats' => $userStats,
                'recent_users' => $samples
            ]);
        } catch (Exception $e) {
            Response::error("DB Debug Failed: " . $e->getMessage(), 500);
        }
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