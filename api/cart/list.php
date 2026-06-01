<?php

require_once __DIR__ . '/../../bootstrap.php';
require_once __DIR__ . '/../../services/cart_service.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$user = requireLogin();

try {
    $pdo  = getDBConnection();
    $cart = getCartItems($pdo, (int) $user['user_id']);
    sendResponse(true, 'Cart retrieved', $cart);
} catch (PDOException $e) {
    sendResponse(false, 'Failed to retrieve cart', null, 500);
}
