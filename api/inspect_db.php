<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/helpers/Response.php';

try {
    $db = Database::getInstance();
    $tables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    
    $results = [
        'tables' => $tables,
        'group_posts_columns' => $db->query("SHOW COLUMNS FROM group_posts")->fetchAll(PDO::FETCH_ASSOC),
    ];
    
    if (in_array('post_comments', $tables)) {
        $results['post_comments_columns'] = $db->query("SHOW COLUMNS FROM post_comments")->fetchAll(PDO::FETCH_ASSOC);
    } else {
        $results['post_comments_columns'] = 'TABLE MISSING';
    }
    
    Response::success($results);
} catch (Exception $e) {
    Response::error($e->getMessage());
}
?>
