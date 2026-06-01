<?php

require_once __DIR__ . '/../../bootstrap.php';
require_once __DIR__ . '/../../services/order_service.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$user = requireLogin();

$scopeRaw = isset($_GET['scope']) ? trim($_GET['scope']) : '';
$scope    = in_array($scopeRaw, ['active', 'history'], true) ? $scopeRaw : 'history';

try {
    $pdo    = getDBConnection();
    $orders = getMyOrders($pdo, (int) $user['user_id'], $scope);
    sendResponse(true, 'Orders retrieved', $orders);
} catch (PDOException $e) {
    sendResponse(false, 'Failed to retrieve orders', null, 500);
}
