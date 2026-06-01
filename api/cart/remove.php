<?php

require_once __DIR__ . '/../../bootstrap.php';
require_once __DIR__ . '/../../services/cart_service.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$user = requireLogin();
$data = getJsonInput();

if (!validateRequired($data, ['cart_item_id'])) {
    sendResponse(false, 'Missing required fields', null, 400);
}

$cartItemId = $data['cart_item_id'];

if (!validatePositiveInteger($cartItemId)) {
    sendResponse(false, 'cart_item_id must be a positive integer', null, 400);
}

try {
    $pdo = getDBConnection();
    removeCartItem($pdo, (int) $user['user_id'], (int) $cartItemId);
    sendResponse(true, 'Cart item removed', null);
} catch (PDOException $e) {
    sendResponse(false, 'Failed to remove cart item', null, 500);
}
