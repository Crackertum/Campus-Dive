<?php
/**
 * Email Service (PHPMailer wrapper)
 */
if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
    if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
        require_once __DIR__ . '/../vendor/autoload.php';
    } else {
        require_once dirname(__DIR__, 2) . '/vendor/autoload.php';
    public static function sendNotification(string $to, string $subject, string $message): bool {
        $html = "
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;'>
                <h2 style='color: #6366f1; margin-top: 0;'>Campus Dive Notification</h2>
                <p style='font-size: 16px; color: #333; line-height: 1.6;'>{$message}</p>
                <hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;'>
                <p style='color: #999; font-size: 12px;'>This is an automated notification from Campus Dive. Please do not reply to this email.</p>
            </div>
        ";
        return self::send($to, $subject, $html);
    }
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class EmailService {

    public static function send(string $to, string $subject, string $htmlBody): bool {
        $apiKey = MAIL_PASSWORD;

        // If it looks like a Resend key, use Resend API
        if (str_starts_with($apiKey, 're_')) {
            $apiUrl = 'https://api.resend.com/emails';
            $data = [
                'from'    => MAIL_FROM_NAME . ' <' . MAIL_FROM_ADDRESS . '>',
                'to'      => [$to],
                'subject' => $subject,
                'html'    => $htmlBody,
            ];

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $apiUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . $apiKey,
                'Content-Type: application/json'
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            curl_close($ch);

            if ($httpCode >= 200 && $httpCode < 300) {
                return true;
            }
            error_log("Resend API Failed ($httpCode): $response $error");
        } 
        // Otherwise, fallback to SMTP/PHPMailer
        else {
            try {
                $mail = new PHPMailer(true);
                $mail->isSMTP();
                $mail->Host       = MAIL_HOST;
                $mail->SMTPAuth   = true;
                $mail->Username   = MAIL_USERNAME;
                $mail->Password   = MAIL_PASSWORD;
                $mail->SMTPSecure = (MAIL_PORT == 465) ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
                $mail->Port       = MAIL_PORT;
                $mail->setFrom(MAIL_FROM_ADDRESS, MAIL_FROM_NAME);
                $mail->addAddress($to);
                $mail->isHTML(true);
                $mail->Subject = $subject;
                $mail->Body    = $htmlBody;
                $mail->AltBody = strip_tags($htmlBody);
                $mail->send();
                return true;
            } catch (Exception $e) {
                error_log("PHPMailer SMTP Failed for $to: {$mail->ErrorInfo} (Host: " . MAIL_HOST . ", User: " . MAIL_USERNAME . ")");
            }
        }

        // Persistent logging for failures
        $errorLog = dirname(__DIR__) . '/logs/email_errors.log';
        if (!is_dir(dirname($errorLog))) mkdir(dirname($errorLog), 0777, true);
        $logMessage = "[" . date('Y-m-d H:i:s') . "] Email delivery failed for $to. Host: " . MAIL_HOST . "\n";
        file_put_contents($errorLog, $logMessage, FILE_APPEND);

        return false;
    }

    public static function sendVerification(string $to, string $firstname, string $token): bool {
        $baseUrl = rtrim(getenv('APP_URL') ?: 'https://campus-dive-production.up.railway.app', '/');
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
        $frontendUrl = rtrim(getenv('FRONTEND_URL') ?: 'https://campus-dive.vercel.app', '/');
        $link = $frontendUrl . '/#/reset-password?token=' . $token;
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