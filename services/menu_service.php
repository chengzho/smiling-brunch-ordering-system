<?php

function getMenuItems(PDO $pdo, ?int $categoryId = null, ?string $keyword = null): array {
    $sql = '
        SELECT
            m.item_id,
            m.category_id,
            c.category_name,
            m.item_name,
            m.description,
            m.price,
            m.image_url,
            m.is_available
        FROM menu_items m
        JOIN categories c ON m.category_id = c.category_id
        WHERE m.is_available = 1
    ';

    $params = [];

    if ($categoryId !== null) {
        $sql     .= ' AND m.category_id = ?';
        $params[] = $categoryId;
    }

    if ($keyword !== null && $keyword !== '') {
        $sql     .= ' AND m.item_name LIKE ?';
        $params[] = '%' . $keyword . '%';
    }

    $sql .= ' ORDER BY c.category_id, m.item_id';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    return $stmt->fetchAll();
}

function getAllMenuItemsForAdmin(PDO $pdo): array {
    $stmt = $pdo->prepare('
        SELECT
            m.item_id,
            m.category_id,
            c.category_name,
            m.item_name,
            m.description,
            m.price,
            m.image_url,
            m.is_available
        FROM menu_items m
        JOIN categories c ON m.category_id = c.category_id
        ORDER BY c.category_id, m.item_id
    ');
    $stmt->execute();

    return $stmt->fetchAll();
}

function createMenuItem(
    PDO $pdo,
    int $categoryId,
    string $itemName,
    string $description,
    float $price,
    string $imageUrl
): int {
    $stmt = $pdo->prepare('SELECT category_id FROM categories WHERE category_id = ?');
    $stmt->execute([$categoryId]);
    if (!$stmt->fetch()) {
        sendResponse(false, 'Category not found', null, 404);
    }

    $stmt = $pdo->prepare('
        INSERT INTO menu_items (category_id, item_name, description, price, image_url, is_available)
        VALUES (?, ?, ?, ?, ?, 1)
    ');
    $stmt->execute([$categoryId, $itemName, $description, $price, $imageUrl]);

    return (int) $pdo->lastInsertId();
}

function updateMenuItem(
    PDO $pdo,
    int $itemId,
    int $categoryId,
    string $itemName,
    string $description,
    float $price,
    string $imageUrl,
    int $isAvailable
): void {
    $stmt = $pdo->prepare('SELECT item_id FROM menu_items WHERE item_id = ?');
    $stmt->execute([$itemId]);
    if (!$stmt->fetch()) {
        sendResponse(false, 'Menu item not found', null, 404);
    }

    $stmt = $pdo->prepare('SELECT category_id FROM categories WHERE category_id = ?');
    $stmt->execute([$categoryId]);
    if (!$stmt->fetch()) {
        sendResponse(false, 'Category not found', null, 404);
    }

    $stmt = $pdo->prepare('
        UPDATE menu_items
        SET category_id  = ?,
            item_name    = ?,
            description  = ?,
            price        = ?,
            image_url    = ?,
            is_available = ?
        WHERE item_id = ?
    ');
    $stmt->execute([$categoryId, $itemName, $description, $price, $imageUrl, $isAvailable, $itemId]);
}

function setMenuItemAvailability(PDO $pdo, int $itemId, int $isAvailable): void {
    $stmt = $pdo->prepare('SELECT item_id FROM menu_items WHERE item_id = ?');
    $stmt->execute([$itemId]);
    if (!$stmt->fetch()) {
        sendResponse(false, 'Menu item not found', null, 404);
    }

    $stmt = $pdo->prepare('UPDATE menu_items SET is_available = ? WHERE item_id = ?');
    $stmt->execute([$isAvailable, $itemId]);
}
