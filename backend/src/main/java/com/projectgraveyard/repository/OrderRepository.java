package com.projectgraveyard.repository;

import com.projectgraveyard.entity.Order;
import com.projectgraveyard.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);

    List<Order> findAllByOrderByCreatedAtDesc();

    Optional<Order> findByBuyerIdAndProjectIdAndStatusIn(Long buyerId, Long projectId, List<OrderStatus> statuses);
}
