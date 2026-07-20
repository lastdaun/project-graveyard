package com.projectgraveyard.service;

import com.projectgraveyard.dto.request.CreateOrderRequest;
import com.projectgraveyard.dto.response.OrderResponse;
import com.projectgraveyard.dto.response.ProjectResponse;
import com.projectgraveyard.dto.response.UserResponse;
import com.projectgraveyard.entity.Order;
import com.projectgraveyard.entity.Project;
import com.projectgraveyard.entity.User;
import com.projectgraveyard.enums.ErrorCode;
import com.projectgraveyard.enums.OrderStatus;
import com.projectgraveyard.enums.Role;
import com.projectgraveyard.exception.AppException;
import com.projectgraveyard.repository.OrderRepository;
import com.projectgraveyard.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProjectRepository projectRepository;
    private final ProjectService projectService;

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, User buyer) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new AppException(ErrorCode.PROJECT_NOT_FOUND));

        if (!project.isApproved() || project.getReviewStatus() != com.projectgraveyard.enums.ReviewStatus.APPROVED) {
            throw new AppException(ErrorCode.PROJECT_NOT_APPROVED);
        }

        if (project.getCreator().getId().equals(buyer.getId())) {
            throw new AppException(ErrorCode.CANNOT_BUY_OWN_PROJECT);
        }

        if (project.getPrice() == null || project.getPrice() <= 0) {
            throw new AppException(ErrorCode.ORDER_INVALID_STATUS);
        }

        List<OrderStatus> active = List.of(
                OrderStatus.PENDING_PAYMENT,
                OrderStatus.PAID,
                OrderStatus.PROCESSING_HANDOVER
        );
        orderRepository.findByBuyerIdAndProjectIdAndStatusIn(buyer.getId(), project.getId(), active)
                .ifPresent(o -> {
                    throw new AppException(ErrorCode.ORDER_ALREADY_EXISTS);
                });

        Order order = Order.builder()
                .buyer(buyer)
                .project(project)
                .amount(project.getPrice())
                .status(OrderStatus.PENDING_PAYMENT)
                .build();

        order = orderRepository.save(order);
        log.info("Order {} created for project {} by {}", order.getId(), project.getId(), buyer.getEmail());
        return mapToOrderResponse(order);
    }

    public List<OrderResponse> getMyPurchases(User buyer) {
        return orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyer.getId()).stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getAllOrders(User admin) {
        requireAdmin(admin);
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse mockPay(Long orderId, User buyer) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (!order.getBuyer().getId().equals(buyer.getId()) && buyer.getRole() != Role.ADMIN) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new AppException(ErrorCode.ORDER_INVALID_STATUS);
        }

        order.setStatus(OrderStatus.PAID);
        order.setPaidAt(LocalDateTime.now());
        order = orderRepository.save(order);

        Project project = order.getProject();
        int sold = project.getSoldCount() == null ? 0 : project.getSoldCount();
        project.setSoldCount(sold + 1);
        projectRepository.save(project);

        log.info("Order {} mock-paid", orderId);
        return mapToOrderResponse(order);
    }

    @Transactional
    public OrderResponse completeOrder(Long orderId, User admin) {
        requireAdmin(admin);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() != OrderStatus.PAID && order.getStatus() != OrderStatus.PROCESSING_HANDOVER) {
            throw new AppException(ErrorCode.ORDER_INVALID_STATUS);
        }

        if (order.getStatus() == OrderStatus.PAID) {
            order.setStatus(OrderStatus.PROCESSING_HANDOVER);
            order = orderRepository.save(order);
        }

        order.setStatus(OrderStatus.COMPLETED);
        order.setCompletedAt(LocalDateTime.now());
        order = orderRepository.save(order);
        log.info("Order {} completed by admin {}", orderId, admin.getEmail());
        return mapToOrderResponse(order);
    }

    @Transactional
    public OrderResponse startHandover(Long orderId, User admin) {
        requireAdmin(admin);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() != OrderStatus.PAID) {
            throw new AppException(ErrorCode.ORDER_INVALID_STATUS);
        }

        order.setStatus(OrderStatus.PROCESSING_HANDOVER);
        order = orderRepository.save(order);
        return mapToOrderResponse(order);
    }

    private void requireAdmin(User user) {
        if (user == null || user.getRole() != Role.ADMIN) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
    }

    private OrderResponse mapToOrderResponse(Order order) {
        ProjectResponse project = projectService.mapToProjectResponse(order.getProject());
        return OrderResponse.builder()
                .id(order.getId())
                .buyer(mapToUserResponse(order.getBuyer()))
                .project(project)
                .amount(order.getAmount())
                .status(order.getStatus())
                .paidAt(order.getPaidAt())
                .completedAt(order.getCompletedAt())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatar(user.getAvatar())
                .role(user.getRole())
                .accountType(user.getAccountType())
                .verified(user.isVerified())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
