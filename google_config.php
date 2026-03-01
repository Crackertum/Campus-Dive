<?php
// Google OAuth Configuration
// Get credentials from: https://console.cloud.google.com/apis/credentials

define('GOOGLE_CLIENT_ID', 'your-google-client-id.apps.googleusercontent.com');
define('GOOGLE_CLIENT_SECRET', 'your-google-client-secret');
define('GOOGLE_REDIRECT_URI', 'http://localhost/campus_recruitment/google_callback.php');

// Google API Client Library
// Download from: https://github.com/googleapis/google-api-php-client
// Or install via Composer: composer require google/apiclient:^2.0

require_once 'vendor/autoload.php';

use Google\Client;
use Google\Service\Oauth2;

function getGoogleClient() {
    $client = new Client();
    $client->setClientId(GOOGLE_CLIENT_ID);
    $client->setClientSecret(GOOGLE_CLIENT_SECRET);
    $client->setRedirectUri(GOOGLE_REDIRECT_URI);
    $client->addScope("email");
    $client->addScope("profile");

    return $client;
}

function getGoogleLoginUrl() {
    $client = getGoogleClient();
    return $client->createAuthUrl();
}

function handleGoogleCallback($code) {
    global $conn;

    $client = getGoogleClient();
    $token = $client->fetchAccessTokenWithAuthCode($code);

    if (isset($token['error'])) {
        return ['success' => false, 'error' => $token['error']];
    }

    $client->setAccessToken($token);

    // Get user info
    $oauth2 = new Oauth2($client);
    $googleUser = $oauth2->userinfo->get();

    $email = $googleUser->getEmail();
    $firstname = $googleUser->getGivenName();
    $lastname = $googleUser->getFamilyName();
    $googleId = $googleUser->getId();

    // Check if user exists
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ? OR google_id = ?");
    $stmt->bind_param("ss", $email, $googleId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // User exists - log them in
        $user = $result->fetch_assoc();

        // Update Google ID if not set
        if (empty($user['google_id'])) {
            $update = $conn->prepare("UPDATE users SET google_id = ? WHERE id = ?");
            $update->bind_param("si", $googleId, $user['id']);
            $update->execute();
        }

        // Set session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['firstname'] = $user['firstname'];
        $_SESSION['lastname'] = $user['lastname'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['avatar'] = $user['avatar'];

        return ['success' => true, 'user' => $user];
    } else {
        // New user - create account
        $avatar = strtoupper(substr($firstname, 0, 1) . substr($lastname, 0, 1));
        $randomPassword = password_hash(uniqid(), PASSWORD_DEFAULT);
        $role = 'user'; // Default role for Google sign-ups

        $stmt = $conn->prepare("INSERT INTO users (firstname, lastname, email, google_id, password, role, avatar, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')");
        $stmt->bind_param("sssssss", $firstname, $lastname, $email, $googleId, $randomPassword, $role, $avatar);

        if ($stmt->execute()) {
            $userId = $stmt->insert_id;

            // Set session
            $_SESSION['user_id'] = $userId;
            $_SESSION['firstname'] = $firstname;
            $_SESSION['lastname'] = $lastname;
            $_SESSION['email'] = $email;
            $_SESSION['role'] = $role;
            $_SESSION['avatar'] = $avatar;

            // Send welcome email
            sendNotificationEmail($userId, 'Welcome to The Campus Dive', 
                'Thank you for signing up! Your application is pending approval.');

            return ['success' => true, 'new_user' => true];
        }
    }

    return ['success' => false, 'error' => 'Failed to process Google login'];
}
?>