<?php

require_once __DIR__ . '/../../../bootstrap.php';
require_once __DIR__ . '/../../../services/menu_service.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Method not allowed', null, 405);
}

requireAdmin();

try {
    $pdo   = getDBConnection();
    $items = getAllMenuItemsForAdmin($pdo);
    sendResponse(true, 'Admin menu items retrieved', $items);
} catch (PDOException $e) {
    sendResponse(false, 'Failed to retrieve menu items', null, 500);
}
