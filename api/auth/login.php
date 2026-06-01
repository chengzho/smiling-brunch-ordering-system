<?php

require_once __DIR__ . '/../../bootstrap.php';
require_once __DIR__ . '/../../services/user_service.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$data = getJsonInput();

if (!validateRequired($data, ['email', 'password'])) {
    sendResponse(false, 'Missing required fields', null, 400);
}

$email    = trim($data['email']);
$password = $data['password'];

try {
    $pdo  = getDBConnection();
    $user = loginUser($pdo, $email, $password);
    loginUserSession($user);
    sendResponse(true, 'Login successful', $user);
} catch (PDOException $e) {
    sendResponse(false, 'Login failed', null, 500);
}
