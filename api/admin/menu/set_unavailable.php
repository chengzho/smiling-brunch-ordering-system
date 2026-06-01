<?php

require_once __DIR__ . '/../../../bootstrap.php';
require_once __DIR__ . '/../../../services/menu_service.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

requireAdmin();

$data = getJsonInput();

if (!validateRequired($data, ['item_id'])) {
    sendResponse(false, 'Missing required fields', null, 400);
}

$itemId = (int) $data['item_id'];

try {
    $pdo = getDBConnection();
    setMenuItemAvailability($pdo, $itemId, 0);
    sendResponse(true, 'Menu item set as unavailable', null);
} catch (PDOException $e) {
    sendResponse(false, 'Failed to update menu item', null, 500);
}
