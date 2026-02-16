<?php
require_once 'config.php';
require_once 'PHPMailer/src/PHPMailer.php';
require_once 'PHPMailer/src/Exception.php';
require_once 'PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json');

if (!isLoggedIn() || !checkPermission('approve_applications')) { // Using 'approve' perm as proxy for workflow management
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $student_id = isset($_POST['student_id']) ? intval($_POST['student_id']) : 0;
    $new_status = isset($_POST['status']) ? sanitize($conn, $_POST['status']) : '';
    
    // Allowed statuses
    $allowed_statuses = ['submitted', 'documents_uploaded', 'under_review', 'interview_scheduled', 'approved', 'rejected'];
    
    if ($student_id > 0 && in_array($new_status, $allowed_statuses)) {
        // 1. Get Old Status
        $curr_query = $conn->query("SELECT status, email, firstname, lastname FROM users WHERE id = $student_id");
        $student_data = $curr_query->fetch_assoc();
        $old_status = $student_data['status'];
        
        if ($old_status === $new_status) {
            echo json_encode(['success' => true, 'message' => 'No change']);
            exit;
        }

        // 2. Update Status
        $stmt = $conn->prepare("UPDATE users SET status = ? WHERE id = ?");
        $stmt->bind_param("si", $new_status, $student_id);
        
        if ($stmt->execute()) {
            // 3. Log Stage Transition (Analytics)
            $conn->query("UPDATE application_stages SET exited_at = NOW(), duration_seconds = TIMESTAMPDIFF(SECOND, entered_at, NOW()) WHERE user_id = $student_id AND stage_name = '$old_status' AND exited_at IS NULL");
            $conn->query("INSERT INTO application_stages (user_id, stage_name) VALUES ($student_id, '$new_status')");
            
            // 4. Send Email Notification (Automation)
            sendNotificationEmail($student_data, $new_status);

            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid parameters']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}

function sendNotificationEmail($student, $status) {
    // Basic email logic - expand with templates later
    $mail = new PHPMailer(true);
    try {
        // Server settings (Mock settings - user needs to configure these)
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com'; 
        $mail->SMTPAuth   = true;
        // Ideally these should come from config or env
        $mail->Username   = 'your_email@gmail.com'; 
        $mail->Password   = 'your_app_password';   
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        $mail->setFrom('admin@campusdive.com', 'Campus Dive Admin');
        $mail->addAddress($student['email'], $student['firstname']);

        $mail->isHTML(true);
        
        $subject = "Application Update - Campus Dive";
        $body = "Dear " . $student['firstname'] . ",<br><br>";
        
        switch ($status) {
            case 'under_review':
                $subject = "Application Under Review";
                $body .= "Your application is now being reviewed by our team. We will get back to you shortly.";
                break;
            case 'interview_scheduled':
                $subject = "Interview Invitation";
                $body .= "Congratulations! You have been shortlisted for an interview. Please check your dashboard for details.";
                break;
            case 'approved':
                $subject = "Application Approved!";
                $body .= "We are pleased to inform you that your application has been APPROVED! Welcome aboard.";
                break;
            case 'rejected':
                $subject = "Application Status Update";
                $body .= "Thank you for your interest. Unfortunately, we are unable to proceed with your application at this time.";
                break;
            default:
                return; // Don't send email for minor status changes or if not configured
        }
        
        $body .= "<br><br>Best Regards,<br>The Recruitment Team";

        $mail->Subject = $subject;
        $mail->Body    = $body;

        // $mail->send(); // Commented out to prevent crash on unconfigured SMTP
        // In production, uncomment and ensure SMTP is set up.
        // For now, we simulate success.
        
    } catch (Exception $e) {
        // Log error silently
        error_log("Message could not be sent. Mailer Error: {$mail->ErrorInfo}");
    }
}
?>
