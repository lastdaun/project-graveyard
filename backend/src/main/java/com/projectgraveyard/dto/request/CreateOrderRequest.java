package com.projectgraveyard.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateOrderRequest {
    @NotNull(message = "Project ID is required")
    private Long projectId;
}
