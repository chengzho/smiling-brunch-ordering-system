<?php

require_once __DIR__ . '/../../../bootstrap.php';
require_once __DIR__ . '/../../../services/menu_service.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

requireAdmin();

$data = getJsonInput();

if (!validateRequired($data, ['category_id', 'item_name', 'price'])) {
    sendResponse(false, 'Missing required fields', null, 400);
}

$categoryId  = (int) $data['category_id'];
$itemName    = trim($data['item_name']);
$description = isset($data['description']) ? trim($data['description']) : '';
$price       = $data['price'];
$imageUrl    = isset($data['image_url']) ? trim($data['image_url']) : '';

if (!validatePositiveNumber($price)) {
    sendResponse(false, 'Price must be a positive number', null, 400);
}

try {
    $pdo    = getDBConnection();
    $itemId = createMenuItem($pdo, $categoryId, $itemName, $description, (float) $price, $imageUrl);
    sendResponse(true, 'Menu item created', ['item_id' => $itemId]);
} catch (PDOException $e) {
    sendResponse(false, 'Failed to create menu item', null, 500);
}
