<?php

require_once __DIR__ . '/../../bootstrap.php';
require_once __DIR__ . '/../../services/cart_service.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$user = requireLogin();

try {
    $pdo = getDBConnection();
    clearCart($pdo, (int) $user['user_id']);
    sendResponse(true, 'Cart cleared', null);
} catch (PDOException $e) {
    sendResponse(false, 'Failed to clear cart', null, 500);
}
