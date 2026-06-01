<?php

require_once __DIR__ . '/../../../bootstrap.php';
require_once __DIR__ . '/../../../services/admin_service.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Method not allowed', null, 405);
}

requireAdmin();

try {
    $pdo   = getDBConnection();
    $users = getAllUsers($pdo);
    sendResponse(true, 'Users retrieved', $users);
} catch (PDOException $e) {
    sendResponse(false, 'Failed to retrieve users', null, 500);
}
