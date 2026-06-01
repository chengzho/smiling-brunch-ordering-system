<?php

require_once __DIR__ . '/../../bootstrap.php';
require_once __DIR__ . '/../../services/order_service.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$user    = requireLogin();
$orderId = $_GET['id'] ?? null;

if (!validatePositiveInteger($orderId)) {
    sendResponse(false, 'Invalid order ID', null, 400);
}

try {
    $pdo   = getDBConnection();
    $order = getOrderDetail($pdo, (int) $user['user_id'], (int) $orderId);

    if ($order === null) {
        sendResponse(false, 'Order not found', null, 404);
    }

    sendResponse(true, 'Order retrieved', $order);
} catch (PDOException $e) {
    sendResponse(false, 'Failed to retrieve order', null, 500);
}
