<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/helpers/Response.php';

try {
    $db = Database::getInstance();
    
    // Add bio and location columns to users table
    $db->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL AFTER student_id");
    $db->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(255) DEFAULT NULL AFTER bio");
    
    echo "Migration successful: Added bio and location to users table.\n";
} catch (Exception $e) {
    // Fallback for older MySQL without IF NOT EXISTS on columns
    try {
        $db->exec("ALTER TABLE users ADD COLUMN bio TEXT DEFAULT NULL AFTER student_id");
        $db->exec("ALTER TABLE users ADD COLUMN location VARCHAR(255) DEFAULT NULL AFTER bio");
        echo "Migration successful (fallback): Added bio and location to users table.\n";
    } catch (Exception $e2) {
        echo "Migration skipped or failed (columns might exist): " . $e2->getMessage() . "\n";
    }
}
?>
