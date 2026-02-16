<?php
require_once 'config.php';

if (!isLoggedIn()) {
    redirect('index.php');
}

// 1. Get User Data & Profile Score
$user_id = $_SESSION['user_id'];
$user_sql = "SELECT * FROM users WHERE id = $user_id";
$user = $conn->query($user_sql)->fetch_assoc();

// Calculate Profile Score (Mock Logic)
$filled_fields = 0;
$total_fields = 6; // firstname, lastname, email, phone, bio, resume
if ($user['firstname']) $filled_fields++;
if ($user['lastname']) $filled_fields++;
if ($user['email']) $filled_fields++;
// Check documents for resume
$has_resume = $conn->query("SELECT id FROM documents WHERE user_id = $user_id AND document_name = 'Resume'")->num_rows > 0;
if ($has_resume) $filled_fields++;
// ... other fields

$profile_percent = round(($filled_fields / $total_fields) * 100);


// 2. Application Status Tracker
$stages = ['submitted', 'documents_uploaded', 'under_review', 'interview_scheduled', 'approved'];
$current_stage_idx = array_search($user['status'], $stages);
if ($current_stage_idx === false && $user['status'] == 'rejected') $current_stage_idx = -1; // Special case

// 3. Document Checklist
$required_docs = ['Resume', 'Transcript', 'ID Proof'];
$uploaded_docs_res = $conn->query("SELECT document_name, filename, version FROM documents WHERE user_id = $user_id");
$uploaded_docs = [];
while ($d = $uploaded_docs_res->fetch_assoc()) $uploaded_docs[$d['document_name']] = $d;

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Student Portal - Campus Dive</title>
    <link rel="stylesheet" href="styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="dashboard-body">
    <div class="dashboard-container" style="grid-template-columns: 1fr;"> <!-- Full width for student -->
        
        <header class="top-header">
            <h2 style="margin: 0;">Student Portal</h2>
            <div class="header-actions">
                <div class="profile-score" style="display: flex; align-items: center; gap: 10px; margin-right: 20px;">
                    <div class="progress-circle" style="--p:<?php echo $profile_percent; ?>; --b:5px; --c:var(--primary-color);">
                        <?php echo $profile_percent; ?>%
                    </div>
                    <span style="font-size: 0.8em; color: var(--text-muted);">Profile<br>Completed</span>
                </div>
                <button id="theme-toggle" class="theme-toggle"><i class="fas fa-moon"></i></button>
                <a href="logout.php" class="btn-secondary">Logout</a>
            </div>
        </header>

        <main class="wrapper" style="margin-top: 20px;">
            
            <!-- Status Tracker -->
            <div class="dashboard-card" style="margin-bottom: 30px;">
                <h3>Application Status</h3>
                <div class="tracker-container">
                    <?php foreach ($stages as $idx => $stage): 
                        $active = $idx <= $current_stage_idx ? 'active' : '';
                        $current = $idx === $current_stage_idx ? 'current' : '';
                    ?>
                    <div class="step <?php echo $active . ' ' . $current; ?>">
                        <div class="step-icon"><i class="fas fa-check"></i></div>
                        <div class="step-label"><?php echo ucwords(str_replace('_', ' ', $stage)); ?></div>
                    </div>
                    <?php if ($idx < count($stages) - 1): ?>
                    <div class="step-line <?php echo $active; ?>"></div>
                    <?php endif; ?>
                    <?php endforeach; ?>
                </div>
            </div>

            <div class="grid-2-col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                
                <!-- Document Checklist -->
                <div class="dashboard-card">
                    <h3>Document Checklist</h3>
                    <div class="checklist">
                        <?php foreach ($required_docs as $doc): 
                            $is_uploaded = isset($uploaded_docs[$doc]);
                        ?>
                        <div class="checklist-item" style="padding: 15px; border-bottom: 1px solid var(--border-color);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                <strong><?php echo $doc; ?></strong>
                                <?php if ($is_uploaded): ?>
                                    <span class="badge badge-success"><i class="fas fa-check"></i> Uploaded</span>
                                <?php else: ?>
                                    <span class="badge badge-warning"><i class="fas fa-exclamation-triangle"></i> Required</span>
                                <?php endif; ?>
                            </div>
                            <!-- Embed Upload Component -->
                            <?php 
                                $title = "Upload " . $doc; 
                                $doc_type = $doc;
                                $id = strtolower(str_replace(' ', '_', $doc));
                                include 'upload_component.php'; 
                            ?>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- Interview Scheduler / Status -->
                <div class="dashboard-card">
                    <h3>Interview Schedule</h3>
                    <?php if ($user['status'] == 'interview_scheduled'): ?>
                        <div class="alert alert-success">
                            <i class="fas fa-calendar-check"></i> Your interview is confirmed!
                        </div>
                        <!-- Placeholder for fetching actual slot -->
                    <?php elseif ($user['status'] == 'under_review'): ?>
                        <p>Your application is under review. If shortlisted, you will see available slots here.</p>
                        <!-- Mock Slot Picker -->
                        <div class="slots-container" style="margin-top: 15px;">
                             <h4>Available Slots (Demo)</h4>
                             <button class="btn-slot">Mon, 20 Feb 10:00 AM</button>
                             <button class="btn-slot">Mon, 20 Feb 2:00 PM</button>
                        </div>
                    <?php else: ?>
                        <p style="color: var(--text-muted);">Scheduling will be available once your application is reviewed.</p>
                    <?php endif; ?>
                </div>

            </div>

        </main>
    </div>

    <!-- Additional Styles used here -->
    <style>
        .tracker-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 20px;
            overflow-x: auto;
        }
        .step {
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
            z-index: 1;
            min-width: 80px;
        }
        .step-icon {
            width: 40px; 
            height: 40px;
            border-radius: 50%;
            background: var(--input-bg);
            color: var(--text-muted);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 10px;
            transition: var(--transition);
        }
        .step.active .step-icon {
            background: var(--primary-color);
            color: white;
        }
        .step-label { font-size: 0.8em; text-align: center; color: var(--text-muted); }
        .step-line {
            flex: 1;
            height: 3px;
            background: var(--input-bg);
            margin-bottom: 25px; /* align with icon */
        }
        .step-line.active { background: var(--primary-color); }
        
        /* Circular Progress */
        .progress-circle {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: radial-gradient(closest-side, var(--bg-card) 79%, transparent 80% 100%),
            conic-gradient(var(--c) calc(var(--p)*1%), var(--input-bg) 0);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.7em;
            font-weight: bold;
        }
        
        .btn-slot {
            margin: 5px;
            padding: 10px;
            border: 1px solid var(--border-color);
            background: var(--bg-body);
            cursor: pointer;
            border-radius: 5px;
        }
        .btn-slot:hover { border-color: var(--primary-color); color: var(--primary-color); }
    </style>
    <script src="theme.js"></script>
</body>
</html>
