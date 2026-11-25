package com.codehub.backend.model;

public enum ResultStatus {
    PENDING,
    PASSED,
    FAILED,
    TIME_LIMIT_EXCEEDED,
    MEMORY_LIMIT_EXCEEDED,
    COMPILATION_ERROR,
    RUNTIME_ERROR
}
