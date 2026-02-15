<?php
require_once 'config.php';

// Check if user is logged in and is admin
if (!isLoggedIn() || !isAdmin()) {
    redirect('index.php');
}

// Get statistics
$stats = [];

// Total students
$result = $conn->query("SELECT COUNT(*) as count FROM users WHERE role = 'user'");
$stats['total_students'] = $result->fetch_assoc()['count'];

// Pending applications
$result = $conn->query("SELECT COUNT(*) as count FROM users WHERE role = 'user' AND status = 'pending'");
$stats['pending'] = $result->fetch_assoc()['count'];

// Approved applications
$result = $conn->query("SELECT COUNT(*) as count FROM users WHERE role = 'user' AND status = 'approved'");
$stats['approved'] = $result->fetch_assoc()['count'];

// Total documents
$result = $conn->query("SELECT COUNT(*) as count FROM documents");
$stats['total_documents'] = $result->fetch_assoc()['count'];

// Unread messages for admin
$stmt = $conn->prepare("SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = FALSE");
$stmt->bind_param("i", $_SESSION['user_id']);
$stmt->execute();
$unread_messages = $stmt->get_result()->fetch_assoc()['count'];

// Get all students
$students = $conn->query("SELECT * FROM users WHERE role = 'user' ORDER BY created_at DESC");

// Get recent messages (both sent and received)
$messages_stmt = $conn->prepare("SELECT m.*, 
                                        sender.firstname as sender_firstname, 
                                        sender.lastname as sender_lastname,
                                        sender.avatar as sender_avatar,
                                        receiver.firstname as receiver_firstname,
                                        receiver.lastname as receiver_lastname
                                 FROM messages m 
                                 JOIN users sender ON m.sender_id = sender.id 
                                 JOIN users receiver ON m.receiver_id = receiver.id
                                 WHERE m.receiver_id = ? OR m.sender_id = ?
                                 ORDER BY m.created_at DESC LIMIT 20");
$messages_stmt->bind_param("ii", $_SESSION['user_id'], $_SESSION['user_id']);
$messages_stmt->execute();
$messages = $messages_stmt->get_result();

// Handle mark individual message as read
if (isset($_GET['read_msg']) && is_numeric($_GET['read_msg'])) {
    $msg_id = intval($_GET['read_msg']);
    $stmt = $conn->prepare("UPDATE messages SET is_read = 1 WHERE id = ? AND receiver_id = ?");
    $stmt->bind_param("ii", $msg_id, $_SESSION['user_id']);
    $stmt->execute();
    redirect('admin_dashboard.php?page=messages');
}

// Handle mark all messages as read
if (isset($_GET['mark_all_read'])) {
    $stmt = $conn->prepare("UPDATE messages SET is_read = 1 WHERE receiver_id = ? AND is_read = 0");
    $stmt->bind_param("i", $_SESSION['user_id']);
    $stmt->execute();
    redirect('admin_dashboard.php?page=messages');
}

// Handle actions
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Approve/Reject student
    if (isset($_POST['action_type']) && isset($_POST['student_id'])) {
        $student_id = intval($_POST['student_id']);
        $action = $_POST['action_type'];
        $status = ($action == 'approve') ? 'approved' : 'rejected';

        $stmt = $conn->prepare("UPDATE users SET status = ? WHERE id = ?");
        $stmt->bind_param("si", $status, $student_id);

        if ($stmt->execute()) {
            // Send notification to student
            $notif_title = $status == 'approved' ? 'Application Approved!' : 'Application Status Update';
            $notif_msg = $status == 'approved' 
                ? 'Congratulations! Your application has been approved. Check your dashboard for the recruitment letter.' 
                : 'Your application status has been updated. Please check your dashboard for details.';

            $notif = $conn->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)");
            $type = $status == 'approved' ? 'success' : 'info';
            $notif->bind_param("isss", $student_id, $notif_title, $notif_msg, $type);
            $notif->execute();

            showAlert('Student ' . $status . ' successfully!');
        }
        // Refresh session to ensure all data is current
        refreshSession($conn, $_SESSION['user_id']);
        redirect('admin_dashboard.php');
    }

    // Send recruitment letter
    if (isset($_POST['send_letter'])) {
        $student_id = intval($_POST['student_id']);
        $letter_content = $_POST['letter_content'];

        $stmt = $conn->prepare("INSERT INTO recruitment_letters (user_id, letter_content, sent_by) VALUES (?, ?, ?)");
        $stmt->bind_param("isi", $student_id, $letter_content, $_SESSION['user_id']);

        if ($stmt->execute()) {
            // Update student status to approved
            $update = $conn->prepare("UPDATE users SET status = 'approved' WHERE id = ?");
            $update->bind_param("i", $student_id);
            $update->execute();

            // Notify student
            $notif = $conn->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, 'Recruitment Letter Received', 'You have received a recruitment letter. Check your dashboard to view it.', 'success')");
            $notif->bind_param("i", $student_id);
            $notif->execute();

            showAlert('Recruitment letter sent successfully!');
        }
        // Refresh session to ensure all data is current
        refreshSession($conn, $_SESSION['user_id']);
        redirect('admin_dashboard.php');
    }

    // Handle message sending to student
    if (isset($_POST['action']) && $_POST['action'] === 'send_message') {
        $receiver_id = isset($_POST['receiver_id']) ? intval($_POST['receiver_id']) : 0;
        $subject = isset($_POST['subject']) ? sanitize($conn, $_POST['subject']) : '';
        $message = isset($_POST['message']) ? sanitize($conn, $_POST['message']) : '';

        if ($receiver_id > 0 && !empty($subject) && !empty($message)) {
            // Insert message
            $insert = $conn->prepare("INSERT INTO messages (sender_id, receiver_id, subject, message, is_read) VALUES (?, ?, ?, ?, 0)");
            $insert->bind_param("iiss", $_SESSION['user_id'], $receiver_id, $subject, $message);

            if ($insert->execute()) {
                // Add notification
                $notif = $conn->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, 'New Message from Admin', ?, 'info')");
                $notif_text = 'You have received a new message: ' . substr($subject, 0, 50);
                $notif->bind_param("is", $receiver_id, $notif_text);
                $notif->execute();

                $_SESSION['alert'] = ['message' => 'Message sent successfully!', 'type' => 'success'];
            } else {
                $_SESSION['alert'] = ['message' => 'Error sending message: ' . $conn->error, 'type' => 'error'];
            }
        } else {
            $_SESSION['alert'] = ['message' => 'Please fill in all fields', 'type' => 'error'];
        }

        // Redirect back
        if (isset($_POST['redirect_to']) && $_POST['redirect_to'] === 'student_view' && $receiver_id > 0) {
            header("Location: admin_dashboard.php?view_student=" . $receiver_id);
        } else {
            header("Location: admin_dashboard.php?page=messages");
        }
        exit();
    }
}

// Get specific student details if viewing
$view_student = null;
$student_documents = null;
if (isset($_GET['view_student'])) {
    $stmt = $conn->prepare("SELECT * FROM users WHERE id = ? AND role = 'user'");
    $stmt->bind_param("i", $_GET['view_student']);
    $stmt->execute();
    $view_student = $stmt->get_result()->fetch_assoc();

    if ($view_student) {
        $doc_stmt = $conn->prepare("SELECT * FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC");
        $doc_stmt->bind_param("i", $view_student['id']);
        $doc_stmt->execute();
        $student_documents = $doc_stmt->get_result();
    }
}

$page = isset($_GET['page']) ? $_GET['page'] : 'dashboard';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - The Campus Dive</title>
    <link rel="stylesheet" href="styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="dashboard-body admin-body">
    <header class="dashboard-header">
        <div class="logo-container">
            <img src="campus.png" alt="The Campus Dive Logo" class="logo-img">
            <h2 class="logo-text">Admin Portal</h2>
        </div>
        <nav class="dashboard-nav">
            <a href="?page=dashboard" class="nav-item <?php echo $page == 'dashboard' ? 'active' : ''; ?>">
                <i class="fas fa-home"></i> Dashboard
            </a>
            <a href="?page=students" class="nav-item <?php echo $page == 'students' ? 'active' : ''; ?>">
                <i class="fas fa-users"></i> Students
            </a>
            <a href="?page=messages" class="nav-item <?php echo $page == 'messages' ? 'active' : ''; ?>">
                <i class="fas fa-envelope"></i> Messages
                <?php if ($unread_messages > 0): ?>
                    <span class="badge"><?php echo $unread_messages; ?></span>
                <?php endif; ?>
            </a>
            <a href="?page=documents" class="nav-item <?php echo $page == 'documents' ? 'active' : ''; ?>">
                <i class="fas fa-file-alt"></i> All Documents
            </a>
            <a href="settings.php" class="nav-item">
                <i class="fas fa-cog"></i> Settings
            </a>
        </nav>
        <div class="user-profile">
            <div class="user-avatar admin-avatar" style="overflow: hidden;">
                <?php 
                $admin_avatar = isset($admin_user['avatar_image']) ? $admin_user['avatar_image'] : (isset($_SESSION['avatar_image']) ? $_SESSION['avatar_image'] : '');
                if (!empty($admin_avatar) && file_exists('uploads/avatars/' . $admin_avatar)): 
                ?>
                    <img src="uploads/avatars/<?php echo $admin_avatar; ?>?t=<?php echo time(); ?>" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">
                <?php else: ?>
                    AD
                <?php endif; ?>
            </div>
            <div class="user-info">
                <span class="user-name"><?php echo $_SESSION['firstname']; ?></span>
                <span class="user-role">Administrator</span>
            </div>
            <div class="user-dropdown">
                <button class="dropdown-btn" onclick="toggleDropdown()">
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="dropdown-content" id="dropdownContent">
                    <a href="settings.php"><i class="fas fa-cog"></i> Settings</a>
                    <a href="logout.php"><i class="fas fa-sign-out-alt"></i> Logout</a>
                </div>
            </div>
        </div>
    </header>

    <main class="dashboard-main">
        <?php if (isset($_SESSION['alert'])): ?>
            <div class="alert alert-<?php echo $_SESSION['alert']['type']; ?>">
                <?php echo $_SESSION['alert']['message']; unset($_SESSION['alert']); ?>
            </div>
        <?php endif; ?>

        <!-- ADMIN DASHBOARD -->
        <?php if ($page == 'dashboard'): ?>
        <div class="dashboard-content">
            <div class="welcome-banner admin-banner">
                <div class="welcome-content">
                    <h1>Admin Dashboard</h1>
                    <p>Manage tech student applications and recruitment process</p>
                </div>
            </div>

            <div class="stats-row">
                <div class="stat-card-large">
                    <div class="stat-icon-bg"><i class="fas fa-users"></i></div>
                    <div class="stat-info">
                        <span class="stat-number-large"><?php echo $stats['total_students']; ?></span>
                        <span class="stat-label-large">Total Students</span>
                    </div>
                </div>
                <div class="stat-card-large pending">
                    <div class="stat-icon-bg"><i class="fas fa-clock"></i></div>
                    <div class="stat-info">
                        <span class="stat-number-large"><?php echo $stats['pending']; ?></span>
                        <span class="stat-label-large">Pending Review</span>
                    </div>
                </div>
                <div class="stat-card-large approved">
                    <div class="stat-icon-bg"><i class="fas fa-check-circle"></i></div>
                    <div class="stat-info">
                        <span class="stat-number-large"><?php echo $stats['approved']; ?></span>
                        <span class="stat-label-large">Approved</span>
                    </div>
                </div>
                <div class="stat-card-large">
                    <div class="stat-icon-bg"><i class="fas fa-file-alt"></i></div>
                    <div class="stat-info">
                        <span class="stat-number-large"><?php echo $stats['total_documents']; ?></span>
                        <span class="stat-label-large">Documents</span>
                    </div>
                </div>
            </div>

            <div class="dashboard-grid admin-grid">
                <!-- Recent Applications -->
                <div class="dashboard-card wide">
                    <div class="card-header">
                        <h3><i class="fas fa-user-clock"></i> Recent Applications</h3>
                        <a href="?page=students" class="btn-small">View All</a>
                    </div>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Applied</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php 
                            $students->data_seek(0);
                            $count = 0;
                            while ($count < 5 && $student = $students->fetch_assoc()): 
                                $count++;
                            ?>
                            <tr>
                                <td>
                                    <div class="user-cell">
                                        <div class="cell-avatar"><?php echo isset($student['avatar']) ? $student['avatar'] : 'NA'; ?></div>
                                        <span><?php echo (isset($student['firstname']) ? $student['firstname'] : '') . ' ' . (isset($student['lastname']) ? $student['lastname'] : ''); ?></span>
                                    </div>
                                </td>
                                <td><?php echo isset($student['email']) ? $student['email'] : 'N/A'; ?></td>
                                <td><span class="status-badge status-<?php echo isset($student['status']) ? $student['status'] : 'pending'; ?>"><?php echo isset($student['status']) ? ucfirst($student['status']) : 'Pending'; ?></span></td>
                                <td><?php echo isset($student['created_at']) ? date('M d', strtotime($student['created_at'])) : 'N/A'; ?></td>
                                <td>
                                    <a href="?view_student=<?php echo isset($student['id']) ? $student['id'] : ''; ?>" class="btn-icon" title="View Details">
                                        <i class="fas fa-eye"></i>
                                    </a>
                                </td>
                            </tr>
                            <?php endwhile; ?>
                        </tbody>
                    </table>
                </div>

                <!-- Recent Messages -->
                <div class="dashboard-card">
                    <div class="card-header">
                        <h3><i class="fas fa-envelope"></i> Recent Messages</h3>
                        <a href="?page=messages" class="btn-small">View All</a>
                    </div>
                    <div class="message-preview-list">
                        <?php 
                        $msg_count = 0;
                        while ($msg = $messages->fetch_assoc() && $msg_count < 5): 
                            $msg_count++;
                        ?>
                        <div class="message-preview <?php echo isset($msg['is_read']) && !$msg['is_read'] ? 'unread' : ''; ?>">
                            <div class="preview-header">
                                <strong><?php echo (isset($msg['firstname']) ? $msg['firstname'] : 'Unknown') . ' ' . (isset($msg['lastname']) ? $msg['lastname'] : ''); ?></strong>
                                <span><?php echo isset($msg['created_at']) ? date('M d', strtotime($msg['created_at'])) : ''; ?></span>
                            </div>
                            <div class="preview-subject"><?php echo isset($msg['subject']) ? htmlspecialchars($msg['subject']) : 'No Subject'; ?></div>
                        </div>
                        <?php endwhile; ?>
                        <?php if ($messages->num_rows == 0): ?>
                            <div class="empty-state small">
                                <p>No messages yet</p>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
        <?php endif; ?>

        <!-- STUDENTS PAGE -->
        <?php if ($page == 'students'): ?>
        <div class="dashboard-content">
            <div class="section-header">
                <h2><i class="fas fa-users"></i> All Students</h2>
                <div class="filter-tabs">
                    <a href="?page=students" class="tab <?php echo !isset($_GET['filter']) ? 'active' : ''; ?>">All</a>
                    <a href="?page=students&filter=pending" class="tab <?php echo isset($_GET['filter']) && $_GET['filter'] == 'pending' ? 'active' : ''; ?>">Pending</a>
                    <a href="?page=students&filter=approved" class="tab <?php echo isset($_GET['filter']) && $_GET['filter'] == 'approved' ? 'active' : ''; ?>">Approved</a>
                    <a href="?page=students&filter=rejected" class="tab <?php echo isset($_GET['filter']) && $_GET['filter'] == 'rejected' ? 'active' : ''; ?>">Rejected</a>
                </div>
            </div>

            <div class="students-grid">
                <?php 
                $filter = isset($_GET['filter']) ? $_GET['filter'] : '';
                $query = "SELECT * FROM users WHERE role = 'user'";
                if ($filter) {
                    $query .= " AND status = '$filter'";
                }
                $query .= " ORDER BY created_at DESC";
                $filtered_students = $conn->query($query);

                while ($student = $filtered_students->fetch_assoc()): 
                ?>
                <div class="student-card">
                    <div class="student-header">
                        <div class="student-avatar-large"><?php echo $student['avatar']; ?></div>
                        <div class="student-info">
                            <h4><?php echo $student['firstname'] . ' ' . $student['lastname']; ?></h4>
                            <span class="student-id">ID: <?php echo $student['student_id']; ?></span>
                        </div>
                        <span class="status-badge status-<?php echo $student['status']; ?>"><?php echo ucfirst($student['status']); ?></span>
                    </div>
                    <div class="student-details">
                        <p><i class="fas fa-envelope"></i> <?php echo $student['email']; ?></p>
                        <p><i class="fas fa-phone"></i> <?php echo $student['phone']; ?></p>
                        <p><i class="fas fa-calendar"></i> Applied: <?php echo date('M d, Y', strtotime($student['created_at'])); ?></p>
                    </div>
                    <div class="student-actions">
                        <a href="?view_student=<?php echo $student['id']; ?>" class="btn-secondary">
                            <i class="fas fa-eye"></i> View
                        </a>
                        <?php if ($student['status'] == 'pending'): ?>
                        <form method="POST" style="display: inline;">
                            <input type="hidden" name="student_id" value="<?php echo $student['id']; ?>">
                            <input type="hidden" name="action_type" value="approve">
                            <button type="submit" class="btn-success">
                                <i class="fas fa-check"></i> Approve
                            </button>
                        </form>
                        <form method="POST" style="display: inline;">
                            <input type="hidden" name="student_id" value="<?php echo $student['id']; ?>">
                            <input type="hidden" name="action_type" value="reject">
                            <button type="submit" class="btn-danger">
                                <i class="fas fa-times"></i> Reject
                            </button>
                        </form>
                        <?php endif; ?>
                    </div>
                </div>
                <?php endwhile; ?>
            </div>
        </div>
        <?php endif; ?>

        <!-- VIEW STUDENT DETAILS -->
        <?php if ($view_student): ?>
        <div class="dashboard-content">
            <div class="section-header">
                <h2><i class="fas fa-user"></i> Student Details</h2>
                <a href="?page=students" class="btn-secondary"><i class="fas fa-arrow-left"></i> Back to List</a>
            </div>

            <div class="student-detail-grid">
                <div class="detail-card profile-card">
                    <div class="profile-header">
                        <div class="profile-avatar">
                        <?php if (!empty($view_student['avatar_image']) && file_exists('uploads/avatars/' . $view_student['avatar_image'])): ?>
                            <img src="uploads/avatars/<?php echo $view_student['avatar_image']; ?>" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 20px;">
                        <?php else: ?>
                            <?php echo $view_student['avatar']; ?>
                        <?php endif; ?>
                    </div>
                        <div class="profile-info">
                            <h3><?php echo $view_student['firstname'] . ' ' . $view_student['lastname']; ?></h3>
                            <span class="profile-status status-<?php echo $view_student['status']; ?>"><?php echo ucfirst($view_student['status']); ?></span>
                        </div>
                    </div>
                    <div class="profile-details">
                        <div class="detail-row">
                            <span class="detail-label">Email:</span>
                            <span class="detail-value"><?php echo $view_student['email']; ?></span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Phone:</span>
                            <span class="detail-value"><?php echo $view_student['phone']; ?></span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Student ID:</span>
                            <span class="detail-value"><?php echo $view_student['student_id']; ?></span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Applied:</span>
                            <span class="detail-value"><?php echo date('F d, Y', strtotime($view_student['created_at'])); ?></span>
                        </div>
                    </div>

                    <?php if ($view_student['status'] == 'pending'): ?>
                    <div class="profile-actions">
                        <form method="POST">
                            <input type="hidden" name="student_id" value="<?php echo $view_student['id']; ?>">
                            <input type="hidden" name="action_type" value="approve">
                            <button type="submit" class="btn-success btn-block">
                                <i class="fas fa-check"></i> Approve Application
                            </button>
                        </form>
                        <form method="POST">
                            <input type="hidden" name="student_id" value="<?php echo $view_student['id']; ?>">
                            <input type="hidden" name="action_type" value="reject">
                            <button type="submit" class="btn-danger btn-block">
                                <i class="fas fa-times"></i> Reject Application
                            </button>
                        </form>
                    </div>
                    <?php endif; ?>
                </div>

                <div class="detail-card documents-card">
                    <h3><i class="fas fa-file-alt"></i> Uploaded Documents</h3>
                    <?php if ($student_documents && $student_documents->num_rows > 0): ?>
                    <div class="document-list">
                        <?php while ($doc = $student_documents->fetch_assoc()): ?>
                        <div class="document-item">
                            <div class="doc-icon">
                                <i class="fas fa-<?php echo strpos($doc['file_type'], 'pdf') !== false ? 'file-pdf' : (strpos($doc['file_type'], 'word') !== false ? 'file-word' : 'file-image'); ?>"></i>
                            </div>
                            <div class="doc-info">
                                <span class="doc-name"><?php echo htmlspecialchars($doc['original_name']); ?></span>
                                <span class="doc-meta"><?php echo round($doc['file_size'] / 1024, 2); ?> KB • <?php echo date('M d, Y', strtotime($doc['uploaded_at'])); ?></span>
                            </div>
                            <a href="uploads/<?php echo $doc['filename']; ?>" target="_blank" class="btn-icon" title="View">
                                <i class="fas fa-eye"></i>
                            </a>
                            <a href="uploads/<?php echo $doc['filename']; ?>" download class="btn-icon" title="Download">
                                <i class="fas fa-download"></i>
                            </a>
                        </div>
                        <?php endwhile; ?>
                    </div>
                    <?php else: ?>
                    <div class="empty-state">
                        <i class="fas fa-folder-open"></i>
                        <p>No documents uploaded yet</p>
                    </div>
                    <?php endif; ?>
                </div>

                <div class="detail-card message-card">
                    <h3><i class="fas fa-paper-plane"></i> Send Message to <?php echo htmlspecialchars($view_student['firstname']); ?></h3>
                    <form method="POST" action="admin_dashboard.php">
                        <input type="hidden" name="action" value="send_message">
                        <input type="hidden" name="receiver_id" value="<?php echo $view_student['id']; ?>">
                        <input type="hidden" name="redirect_to" value="student_view">
                        <div class="input-box">
                            <input type="text" name="subject" placeholder="Subject" required>
                        </div>
                        <div class="input-box">
                            <textarea name="message" rows="4" placeholder="Type your message..." required></textarea>
                        </div>
                        <button type="submit" class="btn-submit">
                            <i class="fas fa-paper-plane"></i> Send Message
                        </button>
                    </form>

                    <!-- Show conversation history with this student -->
                    <div class="conversation-history" style="margin-top: 30px; max-height: 400px; overflow-y: auto;">
                        <h4 style="margin-bottom: 15px; color: var(--text-dark);">Conversation History</h4>
                        <?php
                        // Get conversation with this student
                        $conv_stmt = $conn->prepare("SELECT m.*, 
                                                            sender.firstname as sender_firstname, 
                                                            sender.lastname as sender_lastname,
                                                            sender.role as sender_role
                                                     FROM messages m 
                                                     JOIN users sender ON m.sender_id = sender.id 
                                                     WHERE (m.sender_id = ? AND m.receiver_id = ?) 
                                                        OR (m.sender_id = ? AND m.receiver_id = ?)
                                                     ORDER BY m.created_at ASC");
                        $conv_stmt->bind_param("iiii", $_SESSION['user_id'], $view_student['id'], $view_student['id'], $_SESSION['user_id']);
                        $conv_stmt->execute();
                        $conversation = $conv_stmt->get_result();

                        if ($conversation->num_rows > 0):
                            while ($msg = $conversation->fetch_assoc()):
                                $is_admin_sender = $msg['sender_id'] == $_SESSION['user_id'];
                        ?>
                        <div style="padding: 15px; margin-bottom: 10px; border-radius: 10px; background: <?php echo $is_admin_sender ? 'rgba(30, 90, 168, 0.1)' : 'rgba(39, 174, 96, 0.1)'; ?>;">
                            <div style="font-weight: 600; margin-bottom: 5px; color: var(--text-dark);">
                                <?php echo $is_admin_sender ? 'You (Admin)' : htmlspecialchars($msg['sender_firstname'] . ' ' . $msg['sender_lastname']); ?>
                                <span style="font-size: 0.8em; color: var(--text-light); float: right;">
                                    <?php echo date('M d, Y H:i', strtotime($msg['created_at'])); ?>
                                </span>
                            </div>
                            <div style="font-weight: 500; margin-bottom: 5px;"><?php echo htmlspecialchars($msg['subject']); ?></div>
                            <div style="color: var(--text-light);"><?php echo nl2br(htmlspecialchars($msg['message'])); ?></div>
                        </div>
                        <?php 
                            endwhile;
                        else:
                        ?>
                        <p style="color: var(--text-light); text-align: center; padding: 20px;">No messages yet. Start the conversation!</p>
                        <?php endif; ?>
                    </div>
                </div>

                <?php if ($view_student['status'] == 'approved'): ?>
                <div class="detail-card letter-card">
                    <h3><i class="fas fa-certificate"></i> Send Recruitment Letter</h3>
                    <form method="POST">
                        <input type="hidden" name="student_id" value="<?php echo $view_student['id']; ?>">
                        <div class="input-box">
                            <textarea name="letter_content" rows="8" placeholder="Enter recruitment letter content..." required>Dear <?php echo $view_student['firstname']; ?>,

Congratulations! We are pleased to offer you a position...

Best regards,
The Campus Dive Recruitment Team</textarea>
                        </div>
                        <button type="submit" name="send_letter" class="btn-success btn-block">
                            <i class="fas fa-envelope"></i> Send Recruitment Letter
                        </button>
                    </form>
                </div>
                <?php endif; ?>
            </div>
        </div>
        <?php endif; ?>

        <!-- MESSAGES PAGE -->
        <?php if ($page == 'messages'): 
            // Mark all messages as read when viewing messages page
            $mark_read_stmt = $conn->prepare("UPDATE messages SET is_read = 1 WHERE receiver_id = ? AND is_read = 0");
            $mark_read_stmt->bind_param("i", $_SESSION['user_id']);
            $mark_read_stmt->execute();

            // Refresh unread count
            $stmt = $conn->prepare("SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = FALSE");
            $stmt->bind_param("i", $_SESSION['user_id']);
            $stmt->execute();
            $unread_messages = $stmt->get_result()->fetch_assoc()['count'];
        ?>
        <div class="dashboard-content">
            <div class="section-header">
                <h2><i class="fas fa-envelope"></i> All Messages</h2>
                <?php if ($unread_messages > 0): ?>
                <a href="?page=messages&mark_all_read=1" class="btn-secondary">Mark All as Read</a>
                <?php endif; ?>
            </div>

            <!-- Message Compose Form - Admin can send to any user -->
            <div class="dashboard-card" style="margin-bottom: 25px;">
                <h3><i class="fas fa-paper-plane"></i> Send New Message</h3>
                <form method="POST" action="admin_dashboard.php" style="margin-top: 20px;">
                    <input type="hidden" name="action" value="send_message">
                    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 15px; margin-bottom: 15px;">
                        <div>
                            <label style="display: block; margin-bottom: 5px; color: var(--text-dark); font-weight: 500;">Select Recipient:</label>
                            <select name="receiver_id" required style="width: 100%; padding: 10px; border: 2px solid rgba(30, 90, 168, 0.1); border-radius: 8px;">
                                <option value="">-- Select Student --</option>
                                <?php 
                                $students_list = $conn->query("SELECT id, firstname, lastname, student_id FROM users WHERE role = 'user' ORDER BY firstname");
                                while ($student = $students_list->fetch_assoc()):
                                ?>
                                <option value="<?php echo $student['id']; ?>">
                                    <?php echo htmlspecialchars($student['firstname'] . ' ' . $student['lastname'] . ' (' . $student['student_id'] . ')'); ?>
                                </option>
                                <?php endwhile; ?>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; color: var(--text-dark); font-weight: 500;">Subject:</label>
                            <input type="text" name="subject" required placeholder="Enter subject..." style="width: 100%; padding: 10px; border: 2px solid rgba(30, 90, 168, 0.1); border-radius: 8px;">
                        </div>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: var(--text-dark); font-weight: 500;">Message:</label>
                        <textarea name="message" rows="4" required placeholder="Type your message here..." style="width: 100%; padding: 10px; border: 2px solid rgba(30, 90, 168, 0.1); border-radius: 8px; resize: vertical;"></textarea>
                    </div>
                    <button type="submit" class="btn-submit" style="padding: 12px 30px;">
                        <i class="fas fa-paper-plane"></i> Send Message
                    </button>
                </form>
            </div>

            <div class="messages-container" style="display: block;">
                <div class="message-list full-width">
                    <?php 
                    // Get all messages where admin is sender or receiver
                    $msg_query = "SELECT m.*, 
                                        sender.firstname as sender_firstname, 
                                        sender.lastname as sender_lastname,
                                        sender.role as sender_role,
                                        receiver.firstname as receiver_firstname,
                                        receiver.lastname as receiver_lastname,
                                        receiver.role as receiver_role
                                 FROM messages m 
                                 JOIN users sender ON m.sender_id = sender.id 
                                 JOIN users receiver ON m.receiver_id = receiver.id 
                                 WHERE m.receiver_id = ? OR m.sender_id = ?
                                 ORDER BY m.created_at DESC";
                    $msg_stmt = $conn->prepare($msg_query);
                    $msg_stmt->bind_param("ii", $_SESSION['user_id'], $_SESSION['user_id']);
                    $msg_stmt->execute();
                    $all_messages = $msg_stmt->get_result();

                    if ($all_messages && $all_messages->num_rows > 0):
                        while ($msg = $all_messages->fetch_assoc()): 
                            $is_sender = $msg['sender_id'] == $_SESSION['user_id'];
                            $other_name = $is_sender ? 
                                ($msg['receiver_firstname'] . ' ' . $msg['receiver_lastname']) : 
                                ($msg['sender_firstname'] . ' ' . $msg['sender_lastname']);
                    ?>
                    <div class="message-item <?php echo $is_sender ? 'sent' : 'received'; ?> <?php echo !$msg['is_read'] && !$is_sender ? 'unread' : ''; ?>" style="margin-bottom: 15px; border-left: 4px solid <?php echo $is_sender ? 'var(--primary-color)' : 'var(--success-color)'; ?>;">
                        <div class="message-avatar" style="background: <?php echo $is_sender ? 'var(--primary-color)' : 'var(--success-color)'; ?>;">
                            <?php echo $is_sender ? 'AD' : substr($msg['sender_firstname'], 0, 1) . substr($msg['sender_lastname'], 0, 1); ?>
                        </div>
                        <div class="message-content">
                            <div class="message-header" style="margin-bottom: 8px;">
                                <strong><?php echo $is_sender ? 'You (Admin) → ' . $other_name : $other_name; ?></strong>
                                <span class="message-time" style="float: right; color: var(--text-light); font-size: 0.9em;"><?php echo date('M d, Y H:i', strtotime($msg['created_at'])); ?></span>
                            </div>
                            <div class="message-subject" style="font-weight: 600; color: var(--primary-color); margin-bottom: 5px;"><?php echo htmlspecialchars($msg['subject']); ?></div>
                            <div class="message-body" style="color: var(--text-dark); line-height: 1.5;"><?php echo nl2br(htmlspecialchars($msg['message'])); ?></div>
                            <?php if (!$is_sender): ?>
                            <div style="margin-top: 10px;">
                                <?php if (!$msg['is_read']): ?>
                                <a href="?page=messages&read_msg=<?php echo $msg['id']; ?>" class="btn-small" style="background: #27ae60; margin-right: 5px;">Mark as Read</a>
                                <?php endif; ?>
                                <a href="admin_dashboard.php?view_student=<?php echo $msg['sender_id']; ?>" class="btn-small">Reply</a>
                            </div>
                            <?php endif; ?>
                        </div>
                    </div>
                    <?php 
                        endwhile;
                    else:
                    ?>
                        <div class="empty-state" style="text-align: center; padding: 60px;">
                            <i class="fas fa-inbox" style="font-size: 4em; color: var(--text-light); margin-bottom: 20px;"></i>
                            <p>No messages yet</p>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
        <?php endif; ?>

        <!-- DOCUMENTS PAGE -->
        <?php if ($page == 'documents'): ?>
        <div class="dashboard-content">
            <div class="section-header">
                <h2><i class="fas fa-file-alt"></i> All Documents</h2>
            </div>

            <div class="documents-list full-width">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Document</th>
                            <th>Type</th>
                            <th>Size</th>
                            <th>Uploaded</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php 
                        $all_docs = $conn->query("SELECT d.*, u.firstname, u.lastname 
                                                  FROM documents d 
                                                  JOIN users u ON d.user_id = u.id 
                                                  ORDER BY d.uploaded_at DESC");
                        while ($doc = $all_docs->fetch_assoc()): 
                        ?>
                        <tr>
                            <td><?php echo $doc['firstname'] . ' ' . $doc['lastname']; ?></td>
                            <td>
                                <i class="fas fa-<?php echo strpos($doc['file_type'], 'pdf') !== false ? 'file-pdf' : (strpos($doc['file_type'], 'word') !== false ? 'file-word' : 'file-image'); ?>"></i>
                                <?php echo htmlspecialchars($doc['original_name']); ?>
                            </td>
                            <td><?php echo $doc['file_type']; ?></td>
                            <td><?php echo round($doc['file_size'] / 1024, 2); ?> KB</td>
                            <td><?php echo date('M d, Y', strtotime($doc['uploaded_at'])); ?></td>
                            <td>
                                <a href="uploads/<?php echo $doc['filename']; ?>" target="_blank" class="btn-icon" title="View">
                                    <i class="fas fa-eye"></i>
                                </a>
                                <a href="uploads/<?php echo $doc['filename']; ?>" download class="btn-icon" title="Download">
                                    <i class="fas fa-download"></i>
                                </a>
                            </td>
                        </tr>
                        <?php endwhile; ?>
                        <?php if ($all_docs->num_rows == 0): ?>
                            <tr>
                                <td colspan="6" class="empty-cell">No documents uploaded yet</td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
        <?php endif; ?>
    </main>

    <script>
        function toggleDropdown() {
            document.getElementById('dropdownContent').classList.toggle('show');
        }

        window.onclick = function(e) {
            if (!e.target.matches('.dropdown-btn') && !e.target.matches('.dropdown-btn *')) {
                const dropdown = document.getElementById('dropdownContent');
                if (dropdown.classList.contains('show')) {
                    dropdown.classList.remove('show');
                }
            }
        }
    </script>
</body>
</html>