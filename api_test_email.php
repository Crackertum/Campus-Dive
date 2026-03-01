<?php
/**
 * Test script for API EmailService
 */
require_once __DIR__ . '/api/config/app.php';
require_once __DIR__ . '/api/services/EmailService.php';

// Mocking required constants if they are not defined in app.php
if (!defined('MAIL_HOST')) die("Error: MAIL_HOST not defined. Check api/config/app.php\n");

echo "Testing API EmailService...\n";
echo "Host: " . MAIL_HOST . "\n";
echo "User: " . MAIL_USERNAME . "\n";

$test_email = 'test@example.com';
$test_name = 'CLI Test User';
$test_token = bin2hex(random_bytes(16));

echo "Sending verification email to $test_email...\n";

$result = EmailService::sendVerification($test_email, $test_name, $test_token);

if ($result) {
    echo "\n✅ SUCCESS: Verification email sent via API EmailService!\n";
} else {
    echo "\n❌ FAILURE: Email failed to send. Check PHP error logs.\n";
}
?>
