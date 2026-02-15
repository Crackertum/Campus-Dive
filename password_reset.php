<?php
require_once 'config.php';
require_once 'email_config.php';

$error = '';
$success = '';
$step = 'request'; // request, verify, success

// Step 1: Request password reset
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['request_reset'])) {
    $email = sanitize($conn, $_POST['email']);

    $stmt = $conn->prepare("SELECT id, firstname, lastname FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows == 1) {
        $user = $result->fetch_assoc();

        // Generate reset token
        $reset_token = bin2hex(random_bytes(32));
        $reset_expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

        $update = $conn->prepare("UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?");
        $update->bind_param("ssi", $reset_token, $reset_expires, $user['id']);
        $update->execute();

        // Send reset email
        $resetLink = "http://" . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . "/password_reset.php?token=" . $reset_token;
        $emailBody = "
            <h2>Password Reset Request</h2>
            <p>Hello {$user['firstname']},</p>
            <p>You requested a password reset. Click the link below to reset your password:</p>
            <p><a href='$resetLink' style='padding: 10px 20px; background: #1e5aa8; color: white; text-decoration: none; border-radius: 5px;'>Reset Password</a></p>
            <p>Or copy this link: $resetLink</p>
            <p>This link expires in 1 hour.</p>
            <br>
            <p>If you didn't request this, please ignore this email.</p>
        ";
        sendEmail($email, $user['firstname'] . ' ' . $user['lastname'], 'Password Reset - The Campus Dive', $emailBody);

        $success = 'Password reset link sent to your email. Please check your inbox.';
        $step = 'success';
    } else {
        $error = 'Email not found.';
    }
}

// Step 2: Verify token and reset password
if (isset($_GET['token'])) {
    $token = sanitize($conn, $_GET['token']);

    $stmt = $conn->prepare("SELECT id FROM users WHERE reset_token = ? AND reset_expires > NOW()");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows == 1) {
        $user = $result->fetch_assoc();
        $step = 'verify';

        if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['reset_password'])) {
            $new_password = $_POST['new_password'];
            $confirm_password = $_POST['confirm_password'];

            if ($new_password != $confirm_password) {
                $error = 'Passwords do not match.';
            } elseif (strlen($new_password) < 6) {
                $error = 'Password must be at least 6 characters.';
            } else {
                $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
                $update = $conn->prepare("UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?");
                $update->bind_param("si", $hashed_password, $user['id']);

                if ($update->execute()) {
                    $success = 'Password reset successfully! You can now log in.';
                    $step = 'success';
                } else {
                    $error = 'Failed to reset password. Please try again.';
                }
            }
        }
    } else {
        $error = 'Invalid or expired reset token.';
        $step = 'error';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - The Campus Dive</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="wrapper" style="margin-top: 100px;">
        <div class="form-box">
            <h2>Password Reset</h2>

            <?php if ($error): ?>
                <div class="alert alert-error"><?php echo $error; ?></div>
            <?php endif; ?>

            <?php if ($success): ?>
                <div class="alert alert-success"><?php echo $success; ?></div>
                <a href="index.php" class="btn-submit" style="margin-top: 20px; display: inline-block; width: 100%;">Go to Login</a>
            <?php elseif ($step == 'request'): ?>
                <p style="color: var(--text-light); margin-bottom: 20px;">Enter your email to receive a password reset link.</p>
                <form method="POST">
                    <div class="input-box">
                        <span class="icon"><i class="fas fa-envelope"></i></span>
                        <input type="email" name="email" required>
                        <label>Email Address</label>
                    </div>
                    <button type="submit" name="request_reset" class="btn-submit">Send Reset Link</button>
                </form>
            <?php elseif ($step == 'verify'): ?>
                <p style="color: var(--text-light); margin-bottom: 20px;">Enter your new password.</p>
                <form method="POST">
                    <div class="input-box">
                        <span class="icon"><i class="fas fa-lock"></i></span>
                        <input type="password" name="new_password" required minlength="6">
                        <label>New Password</label>
                    </div>
                    <div class="input-box">
                        <span class="icon"><i class="fas fa-lock"></i></span>
                        <input type="password" name="confirm_password" required>
                        <label>Confirm Password</label>
                    </div>
                    <button type="submit" name="reset_password" class="btn-submit">Reset Password</button>
                </form>
            <?php endif; ?>

            <?php if ($step != 'success'): ?>
            <div class="login-register" style="margin-top: 20px;">
                <p>Remember your password? <a href="index.php">Sign In</a></p>
            </div>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>