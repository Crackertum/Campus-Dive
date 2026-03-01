<?php
// Simple Email Helper - Works without PHPMailer

function sendVerificationEmail($to, $name, $token) {
    $subject = "Verify Your Email - The Campus Dive";
    $verify_link = "http://" . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . "/verify_email.php?token=" . $token;
    
    $message = '
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #1e5aa8, #3d7bc8); color: white; padding: 30px; text-align: center; }
            .header h2 { margin: 0; font-size: 24px; }
            .content { padding: 40px 30px; }
            .button { display: inline-block; padding: 14px 32px; background: #27ae60; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
            .link-box { background: #f8f9fa; padding: 15px; border-radius: 5px; word-break: break-all; margin: 20px 0; border-left: 4px solid #1e5aa8; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e9ecef; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>🎓 The Campus Dive</h2>
            </div>
            <div class="content">
                <h3>Hello ' . htmlspecialchars($name) . ',</h3>
                <p>Thank you for registering! Please verify your email by clicking the button below:</p>
                <p style="text-align: center;">
                    <a href="' . $verify_link . '" class="button">Verify Email Address</a>
                </p>
                <p>Or copy this link:</p>
                <div class="link-box">' . $verify_link . '</div>
                <p><strong>Note:</strong> This link expires in 24 hours.</p>
            </div>
            <div class="footer">
                <p>&copy; ' . date("Y") . ' The Campus Dive. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>';

    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: The Campus Dive <noreply@campusdive.com>" . "\r\n";
    
    $sent = @mail($to, $subject, $message, $headers);
    
    if (!$sent) {
        error_log("[EMAIL FAILED] Failed to send to: " . $to);
    }
    
    return $sent;
}

function getVerificationLink($token) {
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
    $host = $_SERVER['HTTP_HOST'];
    $dir = dirname($_SERVER['PHP_SELF']);
    return $protocol . "://" . $host . $dir . "/verify_email.php?token=" . $token;
}
?>