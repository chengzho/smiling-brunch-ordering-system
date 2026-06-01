<?php

require_once __DIR__ . '/../../bootstrap.php';
require_once __DIR__ . '/../../services/admin_service.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Method not allowed', null, 405);
}

requireAdmin();

try {
    $pdo   = getDBConnection();
    $stats = getDashboardStats($pdo);
    sendResponse(true, 'Dashboard stats retrieved', $stats);
} catch (PDOException $e) {
    sendResponse(false, 'Failed to retrieve dashboard stats', null, 500);
}
