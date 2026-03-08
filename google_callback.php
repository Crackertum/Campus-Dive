<?php
require_once 'config.php';
require_once 'google_config.php';

if (isset($_GET['code'])) {
    $result = handleGoogleCallback($_GET['code']);

    if ($result['success']) {
        $frontend_url = getenv('FRONTEND_URL') ?: 'https://campus-dive.vercel.app';
        
        if (isset($result['new_user'])) {
            // New user - redirect to complete profile
            $_SESSION['alert'] = ['message' => 'Welcome! Please complete your profile.', 'type' => 'success'];
            redirect($frontend_url . '/dashboard?welcome=true');
        } else {
            // Existing user
            redirect($frontend_url . '/dashboard');
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