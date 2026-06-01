<?php

require_once __DIR__ . '/../../../bootstrap.php';
require_once __DIR__ . '/../../../services/user_service.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

requireAdmin();

$data = getJsonInput();

if (!validateRequired($data, ['name', 'email', 'password', 'password_confirm'])) {
    sendResponse(false, 'Missing required fields', null, 400);
}

$name            = trim($data['name']);
$email           = trim($data['email']);
$password        = $data['password'];
$passwordConfirm = $data['password_confirm'];
$phone           = isset($data['phone']) ? trim($data['phone']) : '';

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse(false, 'Invalid email format', null, 400);
}

if (strlen($password) < 6) {
    sendResponse(false, 'Password must be at least 6 characters', null, 400);
}

if ($password !== $passwordConfirm) {
    sendResponse(false, '兩次輸入的密碼不一致', null, 400);
}

try {
    $pdo     = getDBConnection();
    $newUser = createAdminUser($pdo, $name, $email, $password, $phone);
    sendResponse(true, '管理員帳號已建立', $newUser);
} catch (PDOException $e) {
    sendResponse(false, 'Failed to create admin user', null, 500);
}
