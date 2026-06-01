<?php

require_once __DIR__ . '/../../bootstrap.php';
require_once __DIR__ . '/../../services/order_service.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$user = requireLogin();

try {
    $pdo   = getDBConnection();
    $order = createOrderFromCart($pdo, (int) $user['user_id']);
    sendResponse(true, 'Order created', $order);
} catch (PDOException $e) {
    sendResponse(false, 'Failed to create order', null, 500);
}
