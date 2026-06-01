<?php

require_once __DIR__ . '/../../bootstrap.php';
require_once __DIR__ . '/../../services/category_service.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Method not allowed', null, 405);
}

try {
    $pdo        = getDBConnection();
    $categories = getAllCategories($pdo);
    sendResponse(true, 'Categories retrieved', $categories);
} catch (PDOException $e) {
    sendResponse(false, 'Failed to retrieve categories', null, 500);
}
