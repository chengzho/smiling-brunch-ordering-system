<?php

function getAllOrders(PDO $pdo): array {
    $stmt = $pdo->prepare('
        SELECT
            o.order_id,
            o.user_id,
            u.name     AS customer_name,
            o.total_amount,
            o.order_status,
            o.order_time
        FROM orders o
        JOIN users u ON o.user_id = u.user_id
        ORDER BY o.order_time DESC
    ');
    $stmt->execute();
    $orders = $stmt->fetchAll();

    foreach ($orders as &$order) {
        $order['order_id']     = (int)   $order['order_id'];
        $order['user_id']      = (int)   $order['user_id'];
        $order['total_amount'] = (float) $order['total_amount'];
    }
    unset($order);

    return $orders;
}

function updateOrderStatus(PDO $pdo, int $orderId, string $orderStatus): void {
    $stmt = $pdo->prepare('SELECT order_id FROM orders WHERE order_id = ?');
    $stmt->execute([$orderId]);
    if (!$stmt->fetch()) {
        sendResponse(false, 'Order not found', null, 404);
    }

    $stmt = $pdo->prepare('UPDATE orders SET order_status = ? WHERE order_id = ?');
    $stmt->execute([$orderStatus, $orderId]);
}

function getAllUsers(PDO $pdo): array {
    $stmt = $pdo->prepare('
        SELECT
            user_id,
            name,
            email,
            phone,
            role,
            status,
            created_at
        FROM users
        ORDER BY created_at DESC
    ');
    $stmt->execute();
    $users = $stmt->fetchAll();

    foreach ($users as &$user) {
        $user['user_id'] = (int) $user['user_id'];
    }
    unset($user);

    return $users;
}

function updateUserStatus(PDO $pdo, int $userId, string $status): void {
    $stmt = $pdo->prepare('SELECT user_id FROM users WHERE user_id = ?');
    $stmt->execute([$userId]);
    if (!$stmt->fetch()) {
        sendResponse(false, 'User not found', null, 404);
    }

    $stmt = $pdo->prepare('UPDATE users SET status = ? WHERE user_id = ?');
    $stmt->execute([$status, $userId]);
}

function getDashboardStats(PDO $pdo): array {
    $stmt = $pdo->prepare('
        SELECT
            (SELECT COUNT(*)                       FROM users      WHERE role         = "customer"  ) AS customer_count,
            (SELECT COUNT(*)                       FROM menu_items WHERE is_available = 1           ) AS available_menu_count,
            (SELECT COUNT(*)                       FROM orders                                       ) AS order_count,
            (SELECT COALESCE(SUM(total_amount), 0) FROM orders     WHERE order_status = "completed" ) AS completed_sales,
            (SELECT COUNT(*)                       FROM orders     WHERE order_status = "pending"   ) AS pending_order_count,
            (SELECT COUNT(*)                       FROM orders     WHERE order_status = "preparing" ) AS preparing_order_count
    ');
    $stmt->execute();
    $row = $stmt->fetch();

    $stmtProducts = $pdo->prepare('
        SELECT
            m.item_name,
            SUM(oi.quantity) AS total_qty,
            SUM(oi.subtotal) AS total_revenue
        FROM order_items oi
        JOIN menu_items m ON oi.item_id = m.item_id
        JOIN orders o     ON oi.order_id = o.order_id
        WHERE o.order_status != "cancelled"
        GROUP BY oi.item_id, m.item_name
        ORDER BY total_qty DESC
        LIMIT 3
    ');
    $stmtProducts->execute();
    $topProductsRaw = $stmtProducts->fetchAll();

    $topProducts = [];
    foreach ($topProductsRaw as $p) {
        $topProducts[] = [
            'item_name'     => $p['item_name'],
            'total_qty'     => (int)   $p['total_qty'],
            'total_revenue' => (float) $p['total_revenue'],
        ];
    }

    $stmtCustomers = $pdo->prepare('
        SELECT
            u.name           AS customer_name,
            COUNT(o.order_id) AS order_count,
            SUM(o.total_amount) AS total_spent
        FROM orders o
        JOIN users u ON o.user_id = u.user_id
        WHERE u.role = "customer"
          AND o.order_status != "cancelled"
        GROUP BY o.user_id, u.name
        ORDER BY order_count DESC
        LIMIT 3
    ');
    $stmtCustomers->execute();
    $topCustomersRaw = $stmtCustomers->fetchAll();

    $topCustomers = [];
    foreach ($topCustomersRaw as $c) {
        $topCustomers[] = [
            'customer_name' => $c['customer_name'],
            'order_count'   => (int)   $c['order_count'],
            'total_spent'   => (float) $c['total_spent'],
        ];
    }

    return [
        'customer_count'        => (int)   $row['customer_count'],
        'available_menu_count'  => (int)   $row['available_menu_count'],
        'order_count'           => (int)   $row['order_count'],
        'completed_sales'       => (float) $row['completed_sales'],
        'pending_order_count'   => (int)   $row['pending_order_count'],
        'preparing_order_count' => (int)   $row['preparing_order_count'],
        'top_products'          => $topProducts,
        'top_customers'         => $topCustomers,
    ];
}
