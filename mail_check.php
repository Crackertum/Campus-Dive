<?php
require_once 'api/config/app.php';

header('Content-Type: text/plain');
echo "--- Campus Dive Email Config Check ---\n";
echo "MAIL_HOST: " . MAIL_HOST . "\n";
echo "MAIL_PORT: " . MAIL_PORT . "\n";
echo "MAIL_USERNAME: " . MAIL_USERNAME . "\n";
echo "MAIL_FROM_ADDRESS: " . MAIL_FROM_ADDRESS . "\n";
echo "MAIL_PASSWORD length: " . strlen(MAIL_PASSWORD) . "\n";
echo "MAIL_PASSWORD starts with re_: " . (str_starts_with(MAIL_PASSWORD, 're_') ? 'YES' : 'NO') . "\n";

echo "\n--- Environment Check ---\n";
echo "getenv('MAIL_PASSWORD'): " . (getenv('MAIL_PASSWORD') ? 'SET (length ' . strlen(getenv('MAIL_PASSWORD')) . ')' : 'NOT SET') . "\n";
echo "getenv('MAIL_HOST'): " . (getenv('MAIL_HOST') ? 'SET' : 'NOT SET') . "\n";

echo "\n--- Connectivity Check (to SMTP) ---\n";
$connection = @fsockopen(MAIL_HOST, MAIL_PORT, $errno, $errstr, 5);
if ($connection) {
    echo "SUCCESS: Can connect to " . MAIL_HOST . " on port " . MAIL_PORT . "\n";
    fclose($connection);
} else {
    echo "FAILURE: Cannot connect to " . MAIL_HOST . " on port " . MAIL_PORT . "\n";
    echo "Error: $errstr ($errno)\n";
}
?>
