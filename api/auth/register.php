<?php

require_once __DIR__ . '/../../bootstrap.php';
require_once __DIR__ . '/../../services/user_service.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$data = getJsonInput();

if (!validateRequired($data, ['name', 'email', 'password'])) {
    sendResponse(false, 'Missing required fields', null, 400);
}

$name     = trim($data['name']);
$email    = trim($data['email']);
$password = $data['password'];
$phone    = isset($data['phone']) ? trim($data['phone']) : '';

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse(false, 'Invalid email format', null, 400);
}

if (strlen($password) < 6) {
    sendResponse(false, 'Password must be at least 6 characters', null, 400);
}

try {
    $pdo = getDBConnection();
    registerUser($pdo, $name, $email, $password, $phone);
    sendResponse(true, 'Register successful', null, 200);
} catch (PDOException $e) {
    sendResponse(false, 'Registration failed', null, 500);
}
