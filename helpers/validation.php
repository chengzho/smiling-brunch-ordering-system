<?php

function validateRequired(array $data, array $fields): bool {
    foreach ($fields as $field) {
        if (!isset($data[$field]) || $data[$field] === '' || $data[$field] === null) {
            return false;
        }
    }

    return true;
}

function validatePositiveInteger($value): bool {
    return is_numeric($value) && (int) $value == $value && (int) $value > 0;
}

function validatePositiveNumber($value): bool {
    return is_numeric($value) && (float) $value > 0;
}

function validateOrderStatus(string $status): bool {
    return in_array($status, ['pending', 'preparing', 'completed', 'cancelled'], true);
}

function validateUserStatus(string $status): bool {
    return in_array($status, ['active', 'inactive'], true);
}
