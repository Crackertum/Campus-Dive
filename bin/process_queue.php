<?php
require_once dirname(__DIR__) . '/config.php';
require_once dirname(__DIR__) . '/PHPMailer/src/PHPMailer.php';
require_once dirname(__DIR__) . '/PHPMailer/src/SMTP.php';
require_once dirname(__DIR__) . '/PHPMailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Prevent timeout
set_time_limit(0); 

echo "Starting Queue Processor...\n";

// 1. Fetch Pending Items
// Limit to 50 to prevent memory issues, run frequently via Cron
$sql = "SELECT q.*, c.subject 
        FROM marketing_queue q 
        JOIN marketing_campaigns c ON q.campaign_id = c.id 
        WHERE q.status = 'pending' 
        LIMIT 50";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    while ($item = $result->fetch_assoc()) {
        echo "Processing Queue ID: {$item['id']}... ";
        
        $success = sendEmail($item['recipient_contact'], $item['subject'], $item['message_content'], $item['id']);
        
        $status = $success ? 'sent' : 'failed';
        $sent_at = $success ? date('Y-m-d H:i:s') : null;
        $error = $success ? null : "SMTP Error"; // Capture actual error in sendEmail
        
        $upd = $conn->prepare("UPDATE marketing_queue SET status = ?, sent_at = ?, error_message = ? WHERE id = ?");
        $upd->bind_param("sssi", $status, $sent_at, $error, $item['id']);
        $upd->execute();
        
        echo "$status\n";
    }
} else {
    echo "No pending messages.\n";
}

function sendEmail($to, $subject, $body, $queueId) {
    $mail = new PHPMailer(true);
    try {
        // SMTP Settings (Mock)
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com'; 
        $mail->SMTPAuth   = true;
        $mail->Username   = 'admin@campusdive.com'; 
        $mail->Password   = 'password';   
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        $mail->setFrom('admin@campusdive.com', 'Campus Dive');
        $mail->addAddress($to);

        $mail->isHTML(true);
        $mail->Subject = $subject;
        
        // Add Tracking Pixel
        $trackingUrl = "http://localhost/campus%20recruitment/track.php?id=$queueId&type=open";
        $pixel = "<img src='$trackingUrl' width='1' height='1' style='display:none;' />";
        $mail->Body    = $body . $pixel;

        // In production: $mail->send();
        // Simulating success for dev:
        return true; 
        
    } catch (Exception $e) {
        return false;
    }
}
?>
