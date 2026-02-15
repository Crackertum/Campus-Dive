<?php
require_once 'config.php';
require_once 'google_config.php';

if (isset($_GET['code'])) {
    $result = handleGoogleCallback($_GET['code']);

    if ($result['success']) {
        if (isset($result['new_user'])) {
            // New user - redirect to complete profile
            $_SESSION['alert'] = ['message' => 'Welcome! Please complete your profile.', 'type' => 'success'];
            redirect('user_dashboard.php?page=profile');
        } else {
            // Existing user
            $user = $result['user'];
            if ($user['role'] == 'admin') {
                redirect('admin_dashboard.php');
            } else {
                redirect('user_dashboard.php');
            }
        }
    } else {
        $_SESSION['alert'] = ['message' => 'Google login failed: ' . $result['error'], 'type' => 'error'];
        redirect('index.php');
    }
} else {
    $_SESSION['alert'] = ['message' => 'Google login cancelled.', 'type' => 'error'];
    redirect('index.php');
}
?>