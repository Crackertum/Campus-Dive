<?php
/**
 * Auth Controller
 */
class AuthController {

    /** POST /api/auth/login */
    public static function login(): void {
        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

        $v = Validator::make($input)
            ->required('email')
            ->email('email')
            ->required('password');

        if ($v->fails()) {
            Response::validationError($v->errors());
        }

        $user = User::findByEmail($v->sanitized('email'));
        if (!$user) {
            Response::error('Invalid credentials.', 401);
        }

        if (!password_verify($input['password'], $user['password'])) {
            Response::error('Invalid credentials.', 401);
        }

        // Check email verification (skip for admin)
        if (($user['role'] ?? '') !== 'admin' && isset($user['email_verified']) && !$user['email_verified']) {
            Response::error('Please verify your email before logging in.', 403);
        }

        // Start session
        if (session_status() === PHP_SESSION_NONE) session_start();
        $_SESSION['user_id'] = $user['id'];

        // Remove sensitive fields
        unset($user['password'], $user['verification_token'], $user['reset_token'], $user['reset_token_expires']);

        Response::success([
            'user'       => $user,
            'csrf_token' => CsrfMiddleware::getToken(),
        ], 'Login successful.');
    }

    /** POST /api/auth/register */
    public static function register(): void {
        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

        $v = Validator::make($input)
            ->required('firstname')
            ->required('lastname')
            ->required('email')
            ->email('email')
            ->required('phone')
            ->phone('phone')
            ->required('student_id', 'Student ID')
            ->required('password')
            ->minLength('password', 6)
            ->required('confirm_password')
            ->matches('confirm_password', 'password', 'Confirm password', 'Password');

        if ($v->fails()) {
            Response::validationError($v->errors());
        }

        // Check duplicate email
        if (User::findByEmail($v->sanitized('email'))) {
            Response::error('Email already registered.', 409);
        }

        $token = bin2hex(random_bytes(32));
        $userId = User::create([
            'firstname'          => $v->sanitized('firstname'),
            'lastname'           => $v->sanitized('lastname'),
            'email'              => $v->sanitized('email'),
            'phone'              => $v->sanitized('phone'),
            'student_id'         => $v->sanitized('student_id'),
            'password'           => $input['password'],
            'verification_token' => $token,
        ]);

        if (!$userId) {
            Response::error('Registration failed. Please try again.', 500);
        }

        // Send verification email
        EmailService::sendVerification($input['email'], $input['firstname'], $token);

        // Create welcome notification
        Notification::create($userId, 'Welcome!', 'Your account has been created. Please verify your email to get started.', 'success');

        Response::success(null, 'Registration successful! Please check your email to verify your account.', 201);
    }

    /** GET /api/auth/verify-email */
    public static function verifyEmail(): void {
        $token = $_GET['token'] ?? '';
        if (!$token) {
            Response::error('Invalid verification link.', 400);
        }

        if (User::verifyEmail($token)) {
            // Redirect to frontend login with success
            header('Location: ' . CORS_ORIGIN . '/#/login?verified=true');
            exit;
        }

        Response::error('Invalid or expired verification link.', 400);
    }

    /** POST /api/auth/forgot-password */
    public static function forgotPassword(): void {
        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

        $v = Validator::make($input)->required('email')->email('email');
        if ($v->fails()) {
            Response::validationError($v->errors());
        }

        $user = User::findByEmail($v->sanitized('email'));
        
        // Always return success to prevent email enumeration
        if ($user) {
            $token = bin2hex(random_bytes(32));
            User::setResetToken($user['id'], $token);
            EmailService::sendPasswordReset($user['email'], $user['firstname'], $token);
        }

        Response::success(null, 'If an account with that email exists, a reset link has been sent.');
    }

    /** POST /api/auth/reset-password */
    public static function resetPassword(): void {
        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

        $v = Validator::make($input)
            ->required('token')
            ->required('password')
            ->minLength('password', 6)
            ->required('confirm_password')
            ->matches('confirm_password', 'password', 'Confirm password', 'Password');

        if ($v->fails()) {
            Response::validationError($v->errors());
        }

        $user = User::findByResetToken($input['token']);
        if (!$user) {
            Response::error('Invalid or expired reset token.', 400);
        }

        User::updatePassword($user['id'], $input['password']);
        Response::success(null, 'Password has been reset successfully.');
    }

    /** GET /api/auth/me */
    public static function me(): void {
        $user = AuthMiddleware::handle();
        unset($user['password'], $user['verification_token'], $user['reset_token'], $user['reset_token_expires']);

        Response::success([
            'user'       => $user,
            'csrf_token' => CsrfMiddleware::getToken(),
        ]);
    }

    /** POST /api/auth/logout */
    public static function logout(): void {
        if (session_status() === PHP_SESSION_NONE) session_start();
        session_destroy();
        Response::success(null, 'Logged out successfully.');
    }
}
