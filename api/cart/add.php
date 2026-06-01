<?php

require_once __DIR__ . '/../../bootstrap.php';
require_once __DIR__ . '/../../services/cart_service.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$user = requireLogin();
$data = getJsonInput();

if (!validateRequired($data, ['item_id', 'quantity'])) {
    sendResponse(false, 'Missing required fields', null, 400);
}

$itemId   = $data['item_id'];
$quantity = $data['quantity'];

if (!validatePositiveInteger($itemId)) {
    sendResponse(false, 'item_id must be a positive integer', null, 400);
}

if (!validatePositiveInteger($quantity)) {
    sendResponse(false, 'quantity must be a positive integer', null, 400);
}

try {
    $pdo = getDBConnection();
    addToCart($pdo, (int) $user['user_id'], (int) $itemId, (int) $quantity);
    sendResponse(true, 'Item added to cart', null);
} catch (PDOException $e) {
    sendResponse(false, 'Failed to add item to cart', null, 500);
}
