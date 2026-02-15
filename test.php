<?php
echo "PHP is working!<br>";
echo "Server: " . $_SERVER['HTTP_HOST'] . "<br>";
echo "Current path: " . __DIR__ . "<br>";

// Test database
require_once 'config.php';
if ($conn->connect_error) {
    echo "Database: FAILED - " . $conn->connect_error;
} else {
    echo "Database: CONNECTED ✓";
}
?>