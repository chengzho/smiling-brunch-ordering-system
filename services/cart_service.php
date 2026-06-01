<?php

function getOrCreateCart(PDO $pdo, int $userId): int {
    $stmt = $pdo->prepare('SELECT cart_id FROM carts WHERE user_id = ?');
    $stmt->execute([$userId]);
    $cart = $stmt->fetch();

    if ($cart) {
        return (int) $cart['cart_id'];
    }

    $stmt = $pdo->prepare('INSERT INTO carts (user_id) VALUES (?)');
    $stmt->execute([$userId]);

    return (int) $pdo->lastInsertId();
}

function getCartItems(PDO $pdo, int $userId): array {
    $cartId = getOrCreateCart($pdo, $userId);

    $stmt = $pdo->prepare('
        SELECT
            ci.cart_item_id,
            ci.item_id,
            m.item_name,
            m.price,
            m.image_url,
            ci.quantity,
            (m.price * ci.quantity) AS subtotal
        FROM cart_items ci
        JOIN menu_items m ON ci.item_id = m.item_id
        WHERE ci.cart_id = ?
        ORDER BY ci.cart_item_id
    ');
    $stmt->execute([$cartId]);
    $items = $stmt->fetchAll();

    // Cast numeric strings to proper types
    foreach ($items as &$item) {
        $item['cart_item_id'] = (int)   $item['cart_item_id'];
        $item['item_id']      = (int)   $item['item_id'];
        $item['price']        = (float) $item['price'];
        $item['quantity']     = (int)   $item['quantity'];
        $item['subtotal']     = (float) $item['subtotal'];
    }
    unset($item);

    $totalAmount = array_sum(array_column($items, 'subtotal'));

    return [
        'items'        => $items,
        'total_amount' => $totalAmount,
    ];
}

function addToCart(PDO $pdo, int $userId, int $itemId, int $quantity): void {
    // Verify item exists and is available
    $stmt = $pdo->prepare('SELECT item_id FROM menu_items WHERE item_id = ? AND is_available = 1');
    $stmt->execute([$itemId]);
    if (!$stmt->fetch()) {
        sendResponse(false, 'Menu item not found or unavailable', null, 404);
    }

    $cartId = getOrCreateCart($pdo, $userId);

    // Check if item already in cart
    $stmt = $pdo->prepare('
        SELECT cart_item_id, quantity
        FROM cart_items
        WHERE cart_id = ? AND item_id = ?
    ');
    $stmt->execute([$cartId, $itemId]);
    $existing = $stmt->fetch();

    if ($existing) {
        $stmt = $pdo->prepare('
            UPDATE cart_items
            SET quantity = quantity + ?
            WHERE cart_item_id = ?
        ');
        $stmt->execute([$quantity, $existing['cart_item_id']]);
    } else {
        $stmt = $pdo->prepare('
            INSERT INTO cart_items (cart_id, item_id, quantity)
            VALUES (?, ?, ?)
        ');
        $stmt->execute([$cartId, $itemId, $quantity]);
    }
}

function updateCartItem(PDO $pdo, int $userId, int $cartItemId, int $quantity): void {
    // Verify ownership: cart item must belong to this user's cart
    $stmt = $pdo->prepare('
        SELECT ci.cart_item_id
        FROM cart_items ci
        JOIN carts c ON ci.cart_id = c.cart_id
        WHERE ci.cart_item_id = ? AND c.user_id = ?
    ');
    $stmt->execute([$cartItemId, $userId]);
    if (!$stmt->fetch()) {
        sendResponse(false, 'Cart item not found', null, 404);
    }

    $stmt = $pdo->prepare('UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?');
    $stmt->execute([$quantity, $cartItemId]);
}

function removeCartItem(PDO $pdo, int $userId, int $cartItemId): void {
    // Verify ownership
    $stmt = $pdo->prepare('
        SELECT ci.cart_item_id
        FROM cart_items ci
        JOIN carts c ON ci.cart_id = c.cart_id
        WHERE ci.cart_item_id = ? AND c.user_id = ?
    ');
    $stmt->execute([$cartItemId, $userId]);
    if (!$stmt->fetch()) {
        sendResponse(false, 'Cart item not found', null, 404);
    }

    $stmt = $pdo->prepare('DELETE FROM cart_items WHERE cart_item_id = ?');
    $stmt->execute([$cartItemId]);
}

function clearCart(PDO $pdo, int $userId): void {
    $cartId = getOrCreateCart($pdo, $userId);

    $stmt = $pdo->prepare('DELETE FROM cart_items WHERE cart_id = ?');
    $stmt->execute([$cartId]);
}
