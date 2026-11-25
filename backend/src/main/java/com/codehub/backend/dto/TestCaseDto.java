package com.codehub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

public class TestCaseDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private Long problemId;
        private String inputData;
        private String expectedOutput;
        private boolean isHidden;
        private int testCaseOrder;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        @NotBlank(message = "Input data is required")
        private String inputData;

        @NotBlank(message = "Expected output is required")
        private String expectedOutput;

        private boolean isHidden;
        private Integer testCaseOrder;
    }
}
