<?php

require_once __DIR__ . '/../bootstrap.php';

try {
    $pdo = getDBConnection();
    sendResponse(true, 'Backend is healthy', ['database' => 'connected']);
} catch (PDOException $e) {
    sendResponse(false, 'Database connection failed: ' . $e->getMessage(), ['database' => 'disconnected'], 500);
}
