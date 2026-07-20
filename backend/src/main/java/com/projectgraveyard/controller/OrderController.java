package com.projectgraveyard.controller;

import com.projectgraveyard.dto.request.CreateOrderRequest;
import com.projectgraveyard.dto.response.ApiResponse;
import com.projectgraveyard.dto.response.OrderResponse;
import com.projectgraveyard.entity.User;
import com.projectgraveyard.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        OrderResponse response = orderService.createOrder(request, currentUser);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Order created"));
    }

    @GetMapping("/my-purchases")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyPurchases(
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getMyPurchases(currentUser)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderById(id, currentUser)));
    }

    @GetMapping("/my-sales")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMySales(
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getMySales(currentUser)));
    }

    @PatchMapping("/{id}/mock-pay")
    public ResponseEntity<ApiResponse<OrderResponse>> mockPay(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                orderService.mockPay(id, currentUser),
                "Payment successful"
        ));
    }
}
