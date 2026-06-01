<?php

require_once __DIR__ . '/../../../bootstrap.php';
require_once __DIR__ . '/../../../services/admin_service.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$currentAdmin = requireAdmin();

$data = getJsonInput();

if (!validateRequired($data, ['user_id', 'status'])) {
    sendResponse(false, 'Missing required fields', null, 400);
}

$userId = $data['user_id'];
$status = $data['status'];

if (!validatePositiveInteger($userId)) {
    sendResponse(false, 'Invalid user ID', null, 400);
}

if (!validateUserStatus($status)) {
    sendResponse(false, 'Invalid user status', null, 400);
}

// Protection A: cannot disable own account
if ($status === 'inactive' && (int) $userId === $currentAdmin['user_id']) {
    sendResponse(false, '不能停用自己的帳號', null, 400);
}

try {
    $pdo = getDBConnection();

    // Protection B: cannot disable the last active admin
    if ($status === 'inactive') {
        $stmtRole = $pdo->prepare('SELECT role FROM users WHERE user_id = ?');
        $stmtRole->execute([(int) $userId]);
        $targetRole = $stmtRole->fetchColumn();

        if ($targetRole === 'admin') {
            $stmtCount = $pdo->prepare('
                SELECT COUNT(*) FROM users
                WHERE role = ? AND status = ? AND user_id != ?
            ');
            $stmtCount->execute(['admin', 'active', (int) $userId]);
            if ((int) $stmtCount->fetchColumn() === 0) {
                sendResponse(false, '至少需要保留一位啟用中的管理員', null, 400);
            }
        }
    }

    updateUserStatus($pdo, (int) $userId, $status);
    sendResponse(true, 'User status updated', null);
} catch (PDOException $e) {
    sendResponse(false, 'Failed to update user status', null, 500);
}
