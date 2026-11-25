package com.codehub.backend.model;

public enum SubmissionStatus {
    PENDING,
    QUEUED,
    RUNNING,
    ACCEPTED,
    WRONG_ANSWER,
    TIME_LIMIT_EXCEEDED,
    MEMORY_LIMIT_EXCEEDED,
    COMPILATION_ERROR,
    RUNTIME_ERROR,
    INTERNAL_ERROR
}
