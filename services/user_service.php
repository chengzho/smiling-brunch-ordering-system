<?php

function getUserByEmail(PDO $pdo, string $email): ?array {
    $stmt = $pdo->prepare('
        SELECT user_id, name, email, password_hash, phone, role, status, created_at
        FROM users
        WHERE email = ?
        LIMIT 1
    ');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    return $user ?: null;
}

function getUserById(PDO $pdo, int $userId): ?array {
    $stmt = $pdo->prepare('
        SELECT user_id, name, email, phone, role, status, created_at
        FROM users
        WHERE user_id = ?
        LIMIT 1
    ');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    return $user ?: null;
}

function registerUser(PDO $pdo, string $name, string $email, string $password, string $phone): void {
    $existing = getUserByEmail($pdo, $email);

    if ($existing !== null) {
        sendResponse(false, 'Email already exists', null, 400);
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare('
        INSERT INTO users (name, email, password_hash, phone, role, status)
        VALUES (?, ?, ?, ?, \'customer\', \'active\')
    ');
    $stmt->execute([$name, $email, $passwordHash, $phone]);
}

function updateUserProfile(PDO $pdo, int $userId, string $name, string $email, ?string $phone): array {
    $stmt = $pdo->prepare('SELECT user_id FROM users WHERE email = ? AND user_id != ? LIMIT 1');
    $stmt->execute([$email, $userId]);
    if ($stmt->fetch()) {
        sendResponse(false, '該 Email 已被其他帳號使用', null, 400);
    }

    $stmt = $pdo->prepare('UPDATE users SET name = ?, email = ?, phone = ? WHERE user_id = ?');
    $stmt->execute([$name, $email, $phone, $userId]);

    return getUserById($pdo, $userId);
}

function createAdminUser(PDO $pdo, string $name, string $email, string $password, string $phone): array {
    $existing = getUserByEmail($pdo, $email);

    if ($existing !== null) {
        sendResponse(false, '此電子郵件已被使用', null, 400);
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare('
        INSERT INTO users (name, email, password_hash, phone, role, status)
        VALUES (?, ?, ?, ?, \'admin\', \'active\')
    ');
    $stmt->execute([$name, $email, $passwordHash, $phone]);

    $newUserId = (int) $pdo->lastInsertId();
    return getUserById($pdo, $newUserId);
}

function loginUser(PDO $pdo, string $email, string $password): array {
    $user = getUserByEmail($pdo, $email);

    if ($user === null || $user['status'] !== 'active') {
        sendResponse(false, 'Invalid email or password', null, 401);
    }

    if (!password_verify($password, $user['password_hash'])) {
        sendResponse(false, 'Invalid email or password', null, 401);
    }

    unset($user['password_hash']);

    return $user;
}
