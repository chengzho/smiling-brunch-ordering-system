<?php

require_once __DIR__ . '/../../../bootstrap.php';
require_once __DIR__ . '/../../../services/category_service.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

requireAdmin();

$data = getJsonInput();

if (!validateRequired($data, ['category_name'])) {
    sendResponse(false, 'Missing required fields', null, 400);
}

$categoryName = trim($data['category_name']);
$description  = isset($data['description']) ? trim($data['description']) : '';

try {
    $pdo        = getDBConnection();
    $categoryId = createCategory($pdo, $categoryName, $description);
    sendResponse(true, 'Category created', ['category_id' => $categoryId]);
} catch (PDOException $e) {
    sendResponse(false, 'Failed to create category', null, 500);
}
