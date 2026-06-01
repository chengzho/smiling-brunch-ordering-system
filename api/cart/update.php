<?php

require_once __DIR__ . '/../../bootstrap.php';
require_once __DIR__ . '/../../services/cart_service.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$user = requireLogin();
$data = getJsonInput();

if (!validateRequired($data, ['cart_item_id', 'quantity'])) {
    sendResponse(false, 'Missing required fields', null, 400);
}

$cartItemId = $data['cart_item_id'];
$quantity   = $data['quantity'];

if (!validatePositiveInteger($cartItemId)) {
    sendResponse(false, 'cart_item_id must be a positive integer', null, 400);
}

if (!validatePositiveInteger($quantity)) {
    sendResponse(false, 'quantity must be a positive integer (minimum 1)', null, 400);
}

try {
    $pdo = getDBConnection();
    updateCartItem($pdo, (int) $user['user_id'], (int) $cartItemId, (int) $quantity);
    sendResponse(true, 'Cart item updated', null);
} catch (PDOException $e) {
    sendResponse(false, 'Failed to update cart item', null, 500);
}
