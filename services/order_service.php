<?php

function createOrderFromCart(PDO $pdo, int $userId): array {
    // Find the user's cart
    $stmt = $pdo->prepare('SELECT cart_id FROM carts WHERE user_id = ?');
    $stmt->execute([$userId]);
    $cart = $stmt->fetch();

    if (!$cart) {
        sendResponse(false, 'Cart is empty', null, 400);
    }

    $cartId = (int) $cart['cart_id'];

    // Fetch cart items with current menu prices
    $stmt = $pdo->prepare('
        SELECT
            ci.item_id,
            ci.quantity,
            m.price AS unit_price,
            (m.price * ci.quantity) AS subtotal
        FROM cart_items ci
        JOIN menu_items m ON ci.item_id = m.item_id
        WHERE ci.cart_id = ?
    ');
    $stmt->execute([$cartId]);
    $items = $stmt->fetchAll();

    if (empty($items)) {
        sendResponse(false, 'Cart is empty', null, 400);
    }

    $totalAmount = 0.0;
    foreach ($items as $item) {
        $totalAmount += (float) $item['subtotal'];
    }

    $pdo->beginTransaction();

    try {
        $stmt = $pdo->prepare('
            INSERT INTO orders (user_id, total_amount, order_status)
            VALUES (?, ?, "pending")
        ');
        $stmt->execute([$userId, $totalAmount]);
        $orderId = (int) $pdo->lastInsertId();

        $stmt = $pdo->prepare('
            INSERT INTO order_items (order_id, item_id, quantity, unit_price, subtotal)
            VALUES (?, ?, ?, ?, ?)
        ');
        foreach ($items as $item) {
            $stmt->execute([
                $orderId,
                (int)   $item['item_id'],
                (int)   $item['quantity'],
                (float) $item['unit_price'],
                (float) $item['subtotal'],
            ]);
        }

        $stmt = $pdo->prepare('DELETE FROM cart_items WHERE cart_id = ?');
        $stmt->execute([$cartId]);

        $pdo->commit();

        return [
            'order_id'     => $orderId,
            'total_amount' => $totalAmount,
        ];
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
}

function getMyOrders(PDO $pdo, int $userId, string $scope = 'history'): array {
    if ($scope === 'active') {
        $stmt = $pdo->prepare('
            SELECT
                order_id,
                total_amount,
                order_status,
                order_time
            FROM orders
            WHERE user_id = ?
              AND order_status IN ("pending", "preparing")
            ORDER BY order_time DESC
        ');
    } else {
        $stmt = $pdo->prepare('
            SELECT
                order_id,
                total_amount,
                order_status,
                order_time
            FROM orders
            WHERE user_id = ?
            ORDER BY order_time DESC
        ');
    }

    $stmt->execute([$userId]);
    $orders = $stmt->fetchAll();

    foreach ($orders as &$order) {
        $order['order_id']     = (int)   $order['order_id'];
        $order['total_amount'] = (float) $order['total_amount'];
    }
    unset($order);

    return $orders;
}

function getOrderDetail(PDO $pdo, int $userId, int $orderId): ?array {
    $stmt = $pdo->prepare('
        SELECT order_id, total_amount, order_status, order_time
        FROM orders
        WHERE order_id = ? AND user_id = ?
    ');
    $stmt->execute([$orderId, $userId]);
    $order = $stmt->fetch();

    if (!$order) {
        return null;
    }

    $stmt = $pdo->prepare('
        SELECT
            oi.item_id,
            m.item_name,
            oi.quantity,
            oi.unit_price,
            oi.subtotal
        FROM order_items oi
        JOIN menu_items m ON oi.item_id = m.item_id
        WHERE oi.order_id = ?
        ORDER BY oi.order_item_id
    ');
    $stmt->execute([$orderId]);
    $items = $stmt->fetchAll();

    foreach ($items as &$item) {
        $item['item_id']    = (int)   $item['item_id'];
        $item['quantity']   = (int)   $item['quantity'];
        $item['unit_price'] = (float) $item['unit_price'];
        $item['subtotal']   = (float) $item['subtotal'];
    }
    unset($item);

    return [
        'order_id'     => (int)   $order['order_id'],
        'total_amount' => (float) $order['total_amount'],
        'order_status' => $order['order_status'],
        'order_time'   => $order['order_time'],
        'items'        => $items,
    ];
}
