<?php
require_once 'email_config.php';

// Test email
$test_email = 'campusdive.org@gmail.com';  // ← Change to your email
$result = sendEmail($test_email, 'Test User', 'Test Subject', '<h1>Test Email</h1><p>This is a test!</p>');

if ($result) {
    echo "✅ Email sent successfully! Check your inbox.";
} else {
    echo "❌ Email failed. Check error logs.";
}
?>