<?php
// PHPMailer Email Configuration

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

// ═══════════════════════════════════════════════════════
// UPDATE THESE 4 VALUES
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'campusdive.org@gmail.com');
define('SMTP_PASSWORD', 'jjemhxhdicokluxn');
define('SMTP_FROM_EMAIL', 'campusdive.org@gmail.com');
define('SMTP_FROM_NAME', 'The Campus Dive');

// IMPORTANT: Set your base URL here!
// For local testing with XAMPP/WAMP: http://localhost/your-folder
// For production: https://yourdomain.com
define('BASE_URL', 'http://localhost/campus_recruitment'); 
// ═══════════════════════════════════════════════════════

function sendEmail($to, $toName, $subject, $body, $isHTML = true) {
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host       = SMTP_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = SMTP_USERNAME;
        $mail->Password   = SMTP_PASSWORD;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = SMTP_PORT;
        $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
        $mail->addAddress($to, $toName);
        $mail->isHTML($isHTML);
        $mail->Subject = $subject;
        $mail->Body    = $body;
        $mail->AltBody = strip_tags($body);
        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Email failed: {$mail->ErrorInfo}");
        return false;
    }
}

function sendVerificationEmail($to, $name, $token) {
    $verify_link = "http://" . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . "/verify_email.php?token=" . $token;
    $subject = "Verify Your Email - The Campus Dive";
    $body = "<h2>Welcome!</h2><p>Click to verify: <a href='{$verify_link}'>{$verify_link}</a></p>";
    return sendEmail($to, $name, $subject, $body);
}

function getVerificationLink($token) {
    return "http://" . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . "/verify_email.php?token=" . $token;
}
?>