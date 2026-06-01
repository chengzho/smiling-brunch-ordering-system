<?php

require_once __DIR__ . '/../../bootstrap.php';
require_once __DIR__ . '/../../services/menu_service.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$categoryId = isset($_GET['category_id']) ? (int) $_GET['category_id'] : null;
$keyword    = isset($_GET['keyword'])     ? trim($_GET['keyword'])       : null;

try {
    $pdo   = getDBConnection();
    $items = getMenuItems($pdo, $categoryId, $keyword);
    sendResponse(true, 'Menu items retrieved', $items);
} catch (PDOException $e) {
    sendResponse(false, 'Failed to retrieve menu items', null, 500);
}
