<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'email_config.php';

$test_email = 'test@example.com'; // Change this if needed, but we just want to see if PHPMailer errors
$test_name = 'Test User';
$test_token = 'test_token_123';

echo "<h2>PHPMailer Test</h2>";
echo "Attempting to send email to $test_email...<br>";

// Manual send to see detailed errors if any
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$mail = new PHPMailer(true);
$mail->SMTPDebug = 2; // Enable verbose debug output
$mail->Debugoutput = 'echo';

try {
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USERNAME;
    $mail->Password   = SMTP_PASSWORD;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = SMTP_PORT;
    $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
    $mail->addAddress($test_email, $test_name);
    $mail->isHTML(true);
    $mail->Subject = "SMTP Test - " . date('Y-m-d H:i:s');
    $mail->Body    = "This is a test email to verify SMTP configuration.";
    
    if($mail->send()) {
        echo "<br><b style='color: green;'>SUCCESS: Email sent!</b>";
    }
} catch (Exception $e) {
    echo "<br><b style='color: red;'>FAILURE: Email could not be sent.</b><br>";
    echo "Mailer Error: " . $mail->ErrorInfo;
}
?>
