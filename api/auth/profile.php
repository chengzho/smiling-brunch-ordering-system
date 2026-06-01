<?php

require_once __DIR__ . '/../../bootstrap.php';
require_once __DIR__ . '/../../services/user_service.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$sessionUser = requireLogin();
$userId      = (int) $sessionUser['user_id'];

$data = getJsonInput();

$name  = isset($data['name'])  ? trim($data['name'])  : '';
$email = isset($data['email']) ? trim($data['email']) : '';

if ($name === '') {
    sendResponse(false, '姓名為必填欄位', null, 400);
}

if ($email === '') {
    sendResponse(false, '電子郵件為必填欄位', null, 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse(false, '電子郵件格式不正確', null, 400);
}

$phoneRaw = isset($data['phone']) ? trim($data['phone']) : '';
$phone    = ($phoneRaw === '') ? null : $phoneRaw;

try {
    $pdo         = getDBConnection();
    $updatedUser = updateUserProfile($pdo, $userId, $name, $email, $phone);
    loginUserSession($updatedUser);
    sendResponse(true, '個人資料已更新', $updatedUser);
} catch (PDOException $e) {
    sendResponse(false, '更新失敗，請稍後再試', null, 500);
}
