<?php

function getAllCategories(PDO $pdo): array {
    $stmt = $pdo->prepare('
        SELECT category_id, category_name, description
        FROM categories
        ORDER BY category_id
    ');
    $stmt->execute();

    return $stmt->fetchAll();
}

function getAllCategoriesWithItemCount(PDO $pdo): array {
    $stmt = $pdo->prepare('
        SELECT c.category_id, c.category_name, c.description,
               COUNT(m.item_id) AS item_count
        FROM categories c
        LEFT JOIN menu_items m ON m.category_id = c.category_id
        GROUP BY c.category_id, c.category_name, c.description
        ORDER BY c.category_id ASC
    ');
    $stmt->execute();
    $categories = $stmt->fetchAll();

    foreach ($categories as &$cat) {
        $cat['category_id'] = (int) $cat['category_id'];
        $cat['item_count']  = (int) $cat['item_count'];
    }
    unset($cat);

    return $categories;
}

function createCategory(PDO $pdo, string $categoryName, string $description): int {
    $stmt = $pdo->prepare('
        INSERT INTO categories (category_name, description)
        VALUES (?, ?)
    ');
    $stmt->execute([$categoryName, $description]);

    return (int) $pdo->lastInsertId();
}

function updateCategory(PDO $pdo, int $categoryId, string $categoryName, string $description): void {
    $stmt = $pdo->prepare('SELECT category_id FROM categories WHERE category_id = ?');
    $stmt->execute([$categoryId]);
    if (!$stmt->fetch()) {
        sendResponse(false, 'Category not found', null, 404);
    }

    $stmt = $pdo->prepare('
        UPDATE categories
        SET category_name = ?,
            description   = ?
        WHERE category_id = ?
    ');
    $stmt->execute([$categoryName, $description, $categoryId]);
}

function deleteCategory(PDO $pdo, int $categoryId): void {
    $stmt = $pdo->prepare('SELECT category_id FROM categories WHERE category_id = ?');
    $stmt->execute([$categoryId]);
    if (!$stmt->fetch()) {
        sendResponse(false, 'Category not found', null, 404);
    }

    $stmt = $pdo->prepare('SELECT COUNT(*) FROM menu_items WHERE category_id = ?');
    $stmt->execute([$categoryId]);
    if ((int) $stmt->fetchColumn() > 0) {
        sendResponse(false, 'Cannot delete category because it is used by menu items', null, 400);
    }

    $stmt = $pdo->prepare('DELETE FROM categories WHERE category_id = ?');
    $stmt->execute([$categoryId]);
}
