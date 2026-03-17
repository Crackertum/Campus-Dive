<?php
/**
 * Admin Controller for Social Groups
 * Restricted to Campus Admins
 */
class AdminGroupController {

    /**
     * Create a new group
     */
    public static function store(): void {
        $user = AuthMiddleware::handle();
        RoleMiddleware::require([ROLE_ADMIN, 'Admin'], $user);
        
        $input = json_decode(file_get_contents('php://input'), true);
        $db = Database::getInstance();

        $name = trim($input['name'] ?? '');
        $description = trim($input['description'] ?? '');
        $category = trim($input['category'] ?? 'General');
        $managerId = isset($input['manager_id']) ? (int)$input['manager_id'] : null;

        if (empty($name)) {
            Response::error('Group name is required.');
        }

        // Generate slug
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name), '-'));
        
        // Ensure slug uniqueness
        $stmt = $db->prepare("SELECT id FROM social_groups WHERE slug = ?");
        $stmt->execute([$slug]);
        if ($stmt->fetch()) {
            $slug .= '-' . substr(md_with(uniqid()), 0, 5);
        }

        $stmt = $db->prepare("
            INSERT INTO social_groups (name, slug, description, category, created_by, manager_id) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$name, $slug, $description, $category, $user['id'], $managerId]);
        $groupId = $db->lastInsertId();

        // If manager assigned, add them to group_members as manager
        if ($managerId) {
            $db->prepare("INSERT INTO group_members (group_id, user_id, role, status) VALUES (?, ?, 'manager', 'active')")
               ->execute([$groupId, $managerId]);
        }

        Response::success(['id' => $groupId, 'slug' => $slug], 'Group created successfully.');
    }

    /**
     * Delete a group
     */
    public static function destroy(int $id): void {
        $user = AuthMiddleware::handle();
        RoleMiddleware::require([ROLE_ADMIN, 'Admin'], $user);
        
        $db = Database::getInstance();
        $stmt = $db->prepare("DELETE FROM social_groups WHERE id = ?");
        $stmt->execute([$id]);

        Response::success(null, 'Group deleted.');
    }

    /**
     * Assign / Change Group Manager
     */
    public static function assignManager(int $id): void {
        $user = AuthMiddleware::handle();
        RoleMiddleware::require([ROLE_ADMIN, 'Admin'], $user);
        
        $input = json_decode(file_get_contents('php://input'), true);
        $managerId = (int)($input['manager_id'] ?? 0);

        if (!$managerId) {
            Response::error('Manager ID is required.');
        }

        $db = Database::getInstance();
        
        // 1. Remove old manager from group_members role
        $db->prepare("UPDATE group_members SET role = 'member' WHERE group_id = ? AND role = 'manager'")
           ->execute([$id]);

        // 2. Update group manager_id
        $db->prepare("UPDATE social_groups SET manager_id = ? WHERE id = ?")
           ->execute([$managerId, $id]);

        // 3. Add/Update new manager in group_members
        $db->prepare("INSERT INTO group_members (group_id, user_id, role, status) 
                      VALUES (?, ?, 'manager', 'active') 
                      ON DUPLICATE KEY UPDATE role = 'manager', status = 'active'")
           ->execute([$id, $managerId]);

        Response::success(null, 'Group manager assigned.');
    }
}
