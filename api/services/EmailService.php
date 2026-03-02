<?php
/**
 * Email Service (PHPMailer wrapper)
 */
// Autoload is now handled in config/app.php or here as fallback
if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
    if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
        require_once __DIR__ . '/../vendor/autoload.php';
    } else {
        require_once dirname(__DIR__, 2) . '/vendor/autoload.php';
    }
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class EmailService {

    public static function send(string $to, string $subject, string $htmlBody): bool {
        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host       = MAIL_HOST;
            $mail->SMTPAuth   = true;
            $mail->Username   = MAIL_USERNAME;
            $mail->Password   = MAIL_PASSWORD;
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = MAIL_PORT;

            $mail->setFrom(MAIL_FROM_ADDRESS, MAIL_FROM_NAME);
            $mail->addAddress($to);
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $htmlBody;
            $mail->CharSet = 'UTF-8';

            $mail->send();
            return true;
        } catch (Exception $e) {
            $errorLog = dirname(__DIR__) . '/logs/email_errors.log';
            if (!is_dir(dirname($errorLog))) {
                mkdir(dirname($errorLog), 0777, true);
            }
            $timestamp = date('Y-m-d H:i:s');
            $logMessage = "[$timestamp] Email failed to $to: {$mail->ErrorInfo} " . ($e->getMessage()) . "\n";
            file_put_contents($errorLog, $logMessage, FILE_APPEND);
            
            if (APP_DEBUG) {
                error_log("Email failed: " . $mail->ErrorInfo);
            }
            return false;
        }
    }

    public static function sendVerification(string $to, string $firstname, string $token): bool {
        $baseUrl = rtrim(APP_URL, '/');
        $link = $baseUrl . '/api/auth/verify-email?token=' . $token;
        $html = "
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                <h2 style='color: #6366f1;'>Welcome to Campus Dive!</h2>
                <p>Hi {$firstname},</p>
                <p>Thank you for registering. Please verify your email by clicking the button below:</p>
                <a href='{$link}' style='display: inline-block; padding: 12px 30px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;'>Verify Email</a>
                <p style='color: #666; font-size: 14px;'>If you didn't create this account, you can safely ignore this email.</p>
            </div>
        ";
        return self::send($to, 'Verify your Campus Dive account', $html);
    }

    public static function sendPasswordReset(string $to, string $firstname, string $token): bool {
        $link = APP_URL . '/Campus-Dive-main/frontend/#/reset-password?token=' . $token;
        $html = "
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                <h2 style='color: #6366f1;'>Password Reset</h2>
                <p>Hi {$firstname},</p>
                <p>You requested a password reset. Click the button below to set a new password:</p>
                <a href='{$link}' style='display: inline-block; padding: 12px 30px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;'>Reset Password</a>
                <p style='color: #666; font-size: 14px;'>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
            </div>
        ";
        return self::send($to, 'Reset your Campus Dive password', $html);
    }
}
