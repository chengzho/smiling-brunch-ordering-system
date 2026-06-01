<?php

require_once __DIR__ . '/../../../bootstrap.php';
require_once __DIR__ . '/../../../services/category_service.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

requireAdmin();

$data = getJsonInput();

if (!validateRequired($data, ['category_id', 'category_name', 'description'])) {
    sendResponse(false, 'Missing required fields', null, 400);
}

$categoryId   = (int) $data['category_id'];
$categoryName = trim($data['category_name']);
$description  = trim($data['description']);

try {
    $pdo = getDBConnection();
    updateCategory($pdo, $categoryId, $categoryName, $description);
    sendResponse(true, 'Category updated', null);
} catch (PDOException $e) {
    sendResponse(false, 'Failed to update category', null, 500);
}
