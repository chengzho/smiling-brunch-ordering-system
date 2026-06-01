<?php

require_once __DIR__ . '/../../../bootstrap.php';
require_once __DIR__ . '/../../../services/admin_service.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

requireAdmin();

$data = getJsonInput();

if (!validateRequired($data, ['order_id', 'order_status'])) {
    sendResponse(false, 'Missing required fields', null, 400);
}

$orderId     = $data['order_id'];
$orderStatus = $data['order_status'];

if (!validatePositiveInteger($orderId)) {
    sendResponse(false, 'Invalid order ID', null, 400);
}

if (!validateOrderStatus($orderStatus)) {
    sendResponse(false, 'Invalid order status', null, 400);
}

try {
    $pdo = getDBConnection();
    updateOrderStatus($pdo, (int) $orderId, $orderStatus);
    sendResponse(true, 'Order status updated', null);
} catch (PDOException $e) {
    sendResponse(false, 'Failed to update order status', null, 500);
}
