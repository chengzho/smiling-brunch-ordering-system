<?php

require_once __DIR__ . '/../../../bootstrap.php';
require_once __DIR__ . '/../../../services/menu_service.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

requireAdmin();

$data = getJsonInput();

if (!validateRequired($data, ['item_id', 'category_id', 'item_name', 'price', 'is_available'])) {
    sendResponse(false, 'Missing required fields', null, 400);
}

$itemId      = (int) $data['item_id'];
$categoryId  = (int) $data['category_id'];
$itemName    = trim($data['item_name']);
$description = isset($data['description']) ? trim($data['description']) : '';
$price       = $data['price'];
$imageUrl    = isset($data['image_url']) ? trim($data['image_url']) : '';
$isAvailable = (int) $data['is_available'];

if (!validatePositiveNumber($price)) {
    sendResponse(false, 'Price must be a positive number', null, 400);
}

if (!in_array($isAvailable, [0, 1], true)) {
    sendResponse(false, 'is_available must be 0 or 1', null, 400);
}

try {
    $pdo = getDBConnection();
    updateMenuItem($pdo, $itemId, $categoryId, $itemName, $description, (float) $price, $imageUrl, $isAvailable);
    sendResponse(true, 'Menu item updated', null);
} catch (PDOException $e) {
    sendResponse(false, 'Failed to update menu item', null, 500);
}
