<?php
require_once 'config.php';

// Check if user is logged in and is a regular user
if (!isLoggedIn()) {
    redirect('index.php');
}

if (isAdmin()) {
    redirect('admin_dashboard.php');
}

$user_id = $_SESSION['user_id'];

// Get user details including avatar_image
$stmt = $conn->prepare("SELECT id, firstname, lastname, email, phone, student_id, role, avatar, avatar_image, status, created_at FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

// Define page variable early (before any page-dependent logic)
$page = isset($_GET['page']) ? $_GET['page'] : 'dashboard';

// Also update session with latest avatar_image
if ($user && !empty($user['avatar_image'])) {
    $_SESSION['avatar_image'] = $user['avatar_image'];
}

// Get unread messages count
$msg_stmt = $conn->prepare("SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = FALSE");
$msg_stmt->bind_param("i", $user_id);
$msg_stmt->execute();
$unread_messages = $msg_stmt->get_result()->fetch_assoc()['count'];

// Get all messages (both sent and received) with proper user info
$messages_stmt = $conn->prepare("SELECT m.*, 
                                        sender.firstname as sender_firstname, 
                                        sender.lastname as sender_lastname,
                                        sender.role as sender_role,
                                        receiver.firstname as receiver_firstname,
                                        receiver.lastname as receiver_lastname
                                 FROM messages m 
                                 JOIN users sender ON m.sender_id = sender.id 
                                 JOIN users receiver ON m.receiver_id = receiver.id
                                 WHERE m.receiver_id = ? OR m.sender_id = ? 
                                 ORDER BY m.created_at DESC");
$messages_stmt->bind_param("ii", $user_id, $user_id);
$messages_stmt->execute();
$messages = $messages_stmt->get_result();

// Get documents
$doc_stmt = $conn->prepare("SELECT * FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC");
$doc_stmt->bind_param("i", $user_id);
$doc_stmt->execute();
$documents = $doc_stmt->get_result();

// Get recruitment letter if exists
$letter_stmt = $conn->prepare("SELECT * FROM recruitment_letters WHERE user_id = ? ORDER BY sent_at DESC LIMIT 1");
$letter_stmt->bind_param("i", $user_id);
$letter_stmt->execute();
$recruitment_letter = $letter_stmt->get_result()->fetch_assoc();

// Get notifications
$notif_stmt = $conn->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5");
$notif_stmt->bind_param("i", $user_id);
$notif_stmt->execute();
$notifications = $notif_stmt->get_result();

// Handle file upload
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_FILES['document'])) {
    $file = $_FILES['document'];
    $allowed_types = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];

    if (in_array($file['type'], $allowed_types) && $file['size'] <= 5 * 1024 * 1024) { // 5MB max
        $filename = time() . '_' . basename($file['name']);
        $upload_path = 'uploads/' . $filename;

        if (!file_exists('uploads')) {
            mkdir('uploads', 0777, true);
        }

        if (move_uploaded_file($file['tmp_name'], $upload_path)) {
            $stmt = $conn->prepare("INSERT INTO documents (user_id, filename, original_name, file_type, file_size) VALUES (?, ?, ?, ?, ?)");
            $stmt->bind_param("isssi", $user_id, $filename, $file['name'], $file['type'], $file['size']);
            $stmt->execute();

            // Notify admin
            $admin_stmt = $conn->prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
            $admin_stmt->execute();
            $admin = $admin_stmt->get_result()->fetch_assoc();

            $notif_msg = $user['firstname'] . ' ' . $user['lastname'] . ' uploaded a new document: ' . $file['name'];
            $notif = $conn->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, 'New Document Upload', ?, 'info')");
            $notif->bind_param("is", $admin['id'], $notif_msg);
            $notif->execute();

            showAlert('Document uploaded successfully!');
            // Refresh session to ensure all data is current
            refreshSession($conn, $user_id);
            redirect('user_dashboard.php');
        }
    } else {
        $error = 'Invalid file type or size too large (max 5MB)';
    }
}

// Handle message sending to admin
if (isset($_POST['action']) && $_POST['action'] === 'send_message') {
    $subject = isset($_POST['subject']) ? sanitize($conn, $_POST['subject']) : '';
    $message = isset($_POST['message']) ? sanitize($conn, $_POST['message']) : '';

    // Get admin ID
    $admin_stmt = $conn->prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    $admin_stmt->execute();
    $admin_result = $admin_stmt->get_result();

    if ($admin_result && $admin_result->num_rows > 0) {
        $admin = $admin_result->fetch_assoc();
        $admin_id = $admin['id'];

        if (!empty($subject) && !empty($message)) {
            $insert = $conn->prepare("INSERT INTO messages (sender_id, receiver_id, subject, message, is_read) VALUES (?, ?, ?, ?, 0)");
            $insert->bind_param("iiss", $user_id, $admin_id, $subject, $message);

            if ($insert->execute()) {
                // Create notification for admin
                $notif = $conn->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, 'New Message from Student', ?, 'info')");
                $notif_msg = 'New message from ' . $user['firstname'] . ' ' . $user['lastname'] . ': ' . substr($subject, 0, 30);
                $notif->bind_param("is", $admin_id, $notif_msg);
                $notif->execute();

                $_SESSION['alert'] = ['message' => 'Message sent successfully!', 'type' => 'success'];
            } else {
                $_SESSION['alert'] = ['message' => 'Failed to send message: ' . $conn->error, 'type' => 'error'];
            }
        } else {
            $_SESSION['alert'] = ['message' => 'Please fill in all fields', 'type' => 'error'];
        }
    } else {
        $_SESSION['alert'] = ['message' => 'Could not find admin user', 'type' => 'error'];
    }

    // Refresh session to ensure all data is current
    refreshSession($conn, $user_id);

    header("Location: user_dashboard.php?page=messages");
    exit();
}

// Mark messages as read
if (isset($_GET['mark_read']) || isset($_GET['mark_all_read'])) {
    $stmt = $conn->prepare("UPDATE messages SET is_read = 1 WHERE receiver_id = ? AND is_read = 0");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    redirect('user_dashboard.php?page=messages');
}

// Note: Messages are marked as read at the top of messages page section
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Dashboard - The Campus Dive</title>
    <link rel="stylesheet" href="styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="dashboard-body">
    <header class="dashboard-header">
        <div class="logo-container">
            <img src="campus.png" alt="The Campus Dive Logo" class="logo-img">
            <h2 class="logo-text">The Campus Dive</h2>
        </div>
        <nav class="dashboard-nav">
            <a href="?page=dashboard" class="nav-item <?php echo !isset($_GET['page']) || $_GET['page'] == 'dashboard' ? 'active' : ''; ?>">
                <i class="fas fa-home"></i> Dashboard
            </a>
            <a href="?page=messages" class="nav-item <?php echo isset($_GET['page']) && $_GET['page'] == 'messages' ? 'active' : ''; ?>">
                <i class="fas fa-envelope"></i> Messages
                <?php if ($unread_messages > 0): ?>
                    <span class="badge"><?php echo $unread_messages; ?></span>
                <?php endif; ?>
            </a>
            <a href="?page=documents" class="nav-item <?php echo isset($_GET['page']) && $_GET['page'] == 'documents' ? 'active' : ''; ?>">
                <i class="fas fa-file-alt"></i> Documents
            </a>
            <a href="?page=status" class="nav-item <?php echo isset($_GET['page']) && $_GET['page'] == 'status' ? 'active' : ''; ?>">
                <i class="fas fa-clipboard-check"></i> Application Status
            </a>
        </nav>
        <div class="user-profile">
            <div class="user-avatar" style="overflow: hidden;">
                <?php 
                $header_avatar = isset($user['avatar_image']) ? $user['avatar_image'] : (isset($_SESSION['avatar_image']) ? $_SESSION['avatar_image'] : '');
                if (!empty($header_avatar) && file_exists('uploads/avatars/' . $header_avatar)): 
                ?>
                    <img src="uploads/avatars/<?php echo $header_avatar; ?>?t=<?php echo time(); ?>" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">
                <?php else: ?>
                    <?php echo isset($_SESSION['avatar']) ? $_SESSION['avatar'] : 'NA'; ?>
                <?php endif; ?>
            </div>
            <div class="user-info">
                <span class="user-name"><?php echo isset($_SESSION['firstname']) ? $_SESSION['firstname'] : ''; ?> <?php echo isset($_SESSION['lastname']) ? $_SESSION['lastname'] : ''; ?></span>
                <span class="user-role">Tech Student</span>
            </div>
            <div class="user-dropdown">
                <button class="dropdown-btn" onclick="toggleDropdown()">
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="dropdown-content" id="dropdownContent">
                    <a href="settings.php?tab=profile"><i class="fas fa-user"></i> Profile</a>
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

        <?php // $page already defined at top of file ?>

        <!-- DASHBOARD HOME -->
        <?php if ($page == 'dashboard'): ?>
        <div class="dashboard-content">
            <div class="welcome-banner">
                <div class="welcome-content">
                    <h1>Welcome, <?php echo $_SESSION['firstname']; ?>! 👋</h1>
                    <p>Track your recruitment application and communicate with administrators</p>
                </div>
                <div class="status-card status-<?php echo $user['status']; ?>">
                    <i class="fas fa-<?php echo $user['status'] == 'approved' ? 'check-circle' : ($user['status'] == 'rejected' ? 'times-circle' : 'clock'); ?>"></i>
                    <div>
                        <span class="status-label">Application Status</span>
                        <span class="status-value"><?php echo ucfirst($user['status']); ?></span>
                    </div>
                </div>
            </div>

            <div class="dashboard-grid">
                <!-- Quick Stats -->
                <div class="dashboard-card">
                    <h3><i class="fas fa-chart-pie"></i> Overview</h3>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-icon"><i class="fas fa-envelope"></i></span>
                            <div>
                                <span class="stat-value"><?php echo $unread_messages; ?></span>
                                <span class="stat-label">Unread Messages</span>
                            </div>
                        </div>
                        <div class="stat-item">
                            <span class="stat-icon"><i class="fas fa-file"></i></span>
                            <div>
                                <span class="stat-value"><?php echo $documents->num_rows; ?></span>
                                <span class="stat-label">Documents</span>
                            </div>
                        </div>
                        <div class="stat-item">
                            <span class="stat-icon"><i class="fas fa-calendar"></i></span>
                            <div>
                                <span class="stat-value"><?php echo $user['created_at']; ?></span>
                                <span class="stat-label">Member Since</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Notifications -->
                <div class="dashboard-card">
                    <h3><i class="fas fa-bell"></i> Recent Notifications</h3>
                    <ul class="notification-list">
                        <?php while ($notif = $notifications->fetch_assoc()): ?>
                        <li class="<?php echo $notif['is_read'] ? '' : 'unread'; ?>">
                            <i class="fas fa-<?php echo $notif['type'] == 'success' ? 'check-circle' : ($notif['type'] == 'error' ? 'exclamation-circle' : 'info-circle'); ?>"></i>
                            <div>
                                <strong><?php echo $notif['title']; ?></strong>
                                <p><?php echo $notif['message']; ?></p>
                                <small><?php echo date('M d, Y H:i', strtotime($notif['created_at'])); ?></small>
                            </div>
                        </li>
                        <?php endwhile; ?>
                        <?php if ($notifications->num_rows == 0): ?>
                            <li class="empty">No notifications yet</li>
                        <?php endif; ?>
                    </ul>
                </div>

                <!-- Recruitment Letter -->
                <?php if ($recruitment_letter): ?>
                <div class="dashboard-card letter-card">
                    <h3><i class="fas fa-certificate"></i> Recruitment Letter</h3>
                    <div class="letter-content">
                        <?php echo nl2br(htmlspecialchars($recruitment_letter['letter_content'])); ?>
                    </div>
                    <div class="letter-meta">
                        Sent on: <?php echo date('F d, Y', strtotime($recruitment_letter['sent_at'])); ?>
                    </div>
                </div>
                <?php endif; ?>

                <!-- Quick Actions -->
                <div class="dashboard-card">
                    <h3><i class="fas fa-bolt"></i> Quick Actions</h3>
                    <div class="quick-actions">
                        <a href="?page=documents" class="action-btn">
                            <i class="fas fa-upload"></i>
                            <span>Upload Document</span>
                        </a>
                        <a href="?page=messages" class="action-btn">
                            <i class="fas fa-paper-plane"></i>
                            <span>Message Admin</span>
                        </a>
                        <a href="?page=status" class="action-btn">
                            <i class="fas fa-eye"></i>
                            <span>View Status</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
        <?php endif; ?>

        <!-- MESSAGES PAGE -->
        <?php if ($page == 'messages'): 
            // Mark all messages as read when viewing messages page
            $mark_read_stmt = $conn->prepare("UPDATE messages SET is_read = 1 WHERE receiver_id = ? AND is_read = 0");
            $mark_read_stmt->bind_param("i", $user_id);
            $mark_read_stmt->execute();

            // Refresh unread count
            $msg_stmt = $conn->prepare("SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = FALSE");
            $msg_stmt->bind_param("i", $user_id);
            $msg_stmt->execute();
            $unread_messages = $msg_stmt->get_result()->fetch_assoc()['count'];
        ?>
        <div class="dashboard-content">
            <div class="section-header">
                <h2><i class="fas fa-envelope"></i> Messages</h2>
                <?php if ($unread_messages > 0): ?>
                <a href="?page=messages&mark_all_read=1" class="btn-secondary">Mark All as Read</a>
                <?php endif; ?>
            </div>

            <div class="messages-container">
                <div class="message-compose">
                    <h3>Send Message to Admin</h3>
                    <form method="POST" class="message-form">
                        <input type="hidden" name="action" value="send_message">
                        <div class="input-box">
                            <input type="text" name="subject" required placeholder="Subject">
                        </div>
                        <div class="input-box">
                            <textarea name="message" rows="4" required placeholder="Type your message..."></textarea>
                        </div>
                        <button type="submit" class="btn-submit">
                            <i class="fas fa-paper-plane"></i> Send Message
                        </button>
                    </form>
                </div>

                <div class="message-list" style="margin-top: 30px;">
                    <h3>Message History</h3>
                    <?php 
                    // Re-fetch messages to ensure we have all data
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
                    $msg_stmt->bind_param("ii", $user_id, $user_id);
                    $msg_stmt->execute();
                    $messages = $msg_stmt->get_result();

                    if ($messages && $messages->num_rows > 0):
                        while ($msg = $messages->fetch_assoc()): 
                            $is_sender = $msg['sender_id'] == $user_id;
                            $other_firstname = $is_sender ? $msg['receiver_firstname'] : $msg['sender_firstname'];
                            $other_lastname = $is_sender ? $msg['receiver_lastname'] : $msg['sender_lastname'];
                            $other_role = $is_sender ? '' : ($msg['sender_role'] == 'admin' ? ' (Admin)' : '');
                    ?>
                    <div class="message-item <?php echo $is_sender ? 'sent' : 'received'; ?> <?php echo !$msg['is_read'] && !$is_sender ? 'unread' : ''; ?>" style="margin-bottom: 15px; border-left: 4px solid <?php echo $is_sender ? 'var(--primary-color)' : 'var(--success-color)'; ?>;">
                        <div class="message-avatar" style="background: <?php echo $is_sender ? 'var(--primary-color)' : 'var(--success-color)'; ?>;">
                            <?php echo $is_sender ? $_SESSION['avatar'] : substr($other_firstname, 0, 1) . substr($other_lastname, 0, 1); ?>
                        </div>
                        <div class="message-content">
                            <div class="message-header" style="margin-bottom: 8px;">
                                <strong><?php echo $is_sender ? 'You → ' . $other_firstname . ' ' . $other_lastname : $other_firstname . ' ' . $other_lastname . $other_role; ?></strong>
                                <span class="message-time" style="float: right; color: var(--text-light); font-size: 0.9em;"><?php echo date('M d, Y H:i', strtotime($msg['created_at'])); ?></span>
                            </div>
                            <div class="message-subject" style="font-weight: 600; color: var(--primary-color); margin-bottom: 5px;"><?php echo htmlspecialchars($msg['subject']); ?></div>
                            <div class="message-body" style="color: var(--text-dark); line-height: 1.5;"><?php echo nl2br(htmlspecialchars($msg['message'])); ?></div>
                        </div>
                    </div>
                    <?php endwhile;
                    else:
                    ?>
                        <div class="empty-state" style="text-align: center; padding: 40px;">
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
                <h2><i class="fas fa-file-alt"></i> My Documents</h2>
            </div>

            <div class="documents-container">
                <div class="upload-section">
                    <h3>Upload New Document</h3>
                    <form method="POST" enctype="multipart/form-data" class="upload-form">
                        <div class="file-input-wrapper">
                            <input type="file" name="document" id="document" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" required>
                            <label for="document" class="file-label">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <span>Choose file or drag here</span>
                                <small>PDF, DOC, DOCX, JPG, PNG (Max 5MB)</small>
                            </label>
                        </div>
                        <button type="submit" class="btn-submit">
                            <i class="fas fa-upload"></i> Upload Document
                        </button>
                    </form>
                    <?php if (isset($error)): ?>
                        <div class="alert alert-error"><?php echo $error; ?></div>
                    <?php endif; ?>
                </div>

                <div class="documents-list">
                    <h3>Uploaded Documents</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>File Name</th>
                                <th>Type</th>
                                <th>Size</th>
                                <th>Uploaded</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php 
                            $documents->data_seek(0);
                            while ($doc = $documents->fetch_assoc()): 
                            ?>
                            <tr>
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
                            <?php if ($documents->num_rows == 0): ?>
                                <tr>
                                    <td colspan="5" class="empty-cell">No documents uploaded yet</td>
                                </tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <?php endif; ?>

        <!-- STATUS PAGE -->
        <?php if ($page == 'status'): ?>
        <div class="dashboard-content">
            <div class="section-header">
                <h2><i class="fas fa-clipboard-check"></i> Application Status</h2>
            </div>

            <div class="status-container">
                <div class="status-timeline">
                    <div class="timeline-item <?php echo $user['status'] != 'pending' ? 'completed' : 'active'; ?>">
                        <div class="timeline-icon">
                            <i class="fas fa-user-plus"></i>
                        </div>
                        <div class="timeline-content">
                            <h4>Application Submitted</h4>
                            <p>Your application has been received</p>
                            <span class="timeline-date"><?php echo date('M d, Y', strtotime($user['created_at'])); ?></span>
                        </div>
                    </div>

                    <div class="timeline-item <?php echo $user['status'] == 'approved' || $user['status'] == 'rejected' ? 'completed' : ($user['status'] == 'pending' ? 'active' : ''); ?>">
                        <div class="timeline-icon">
                            <i class="fas fa-search"></i>
                        </div>
                        <div class="timeline-content">
                            <h4>Under Review</h4>
                            <p>Admin is reviewing your documents</p>
                        </div>
                    </div>

                    <div class="timeline-item <?php echo $user['status'] == 'approved' ? 'completed' : ($user['status'] == 'rejected' ? 'rejected' : ''); ?>">
                        <div class="timeline-icon">
                            <i class="fas fa-<?php echo $user['status'] == 'rejected' ? 'times' : 'check'; ?>"></i>
                        </div>
                        <div class="timeline-content">
                            <h4><?php echo $user['status'] == 'rejected' ? 'Application Rejected' : 'Decision Made'; ?></h4>
                            <p><?php echo $user['status'] == 'approved' ? 'Congratulations! You have been approved' : ($user['status'] == 'rejected' ? 'Unfortunately, your application was not successful' : 'Awaiting final decision'); ?></p>
                        </div>
                    </div>
                </div>

                <?php if ($recruitment_letter && $user['status'] == 'approved'): ?>
                <div class="recruitment-offer">
                    <div class="offer-header">
                        <i class="fas fa-trophy"></i>
                        <h3>Recruitment Offer</h3>
                    </div>
                    <div class="offer-content">
                        <?php echo nl2br(htmlspecialchars($recruitment_letter['letter_content'])); ?>
                    </div>
                    <div class="offer-actions">
                        <button class="btn-success" onclick="alert('Congratulations on your offer! Please check your email for next steps.')">
                            <i class="fas fa-check"></i> Accept Offer
                        </button>
                        <button class="btn-secondary" onclick="window.location.href='?page=messages'">
                            <i class="fas fa-question"></i> Ask Questions
                        </button>
                    </div>
                </div>
                <?php endif; ?>
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

        // File input display
        document.getElementById('document').addEventListener('change', function() {
            const label = document.querySelector('.file-label span');
            if (this.files.length > 0) {
                label.textContent = this.files[0].name;
            }
        });
    </script>
</body>
</html>