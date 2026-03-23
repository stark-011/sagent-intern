package com.grocery.groceryapp.Controller;

import com.grocery.groceryapp.Entity.Order;
import com.grocery.groceryapp.Service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // Helper DTO for incoming JSON
    public static class OrderRequest {
        public Long userId;
        public Long storeId;
        public Long cartId;
        public String deliveryAddress;
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody OrderRequest request) {
        Order newOrder = orderService.createOrder(
                request.userId,
                request.storeId,
                request.cartId,
                request.deliveryAddress
        );
        return ResponseEntity.ok(newOrder);
    }

    @GetMapping
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Order> updateOrder(@PathVariable Long id, @RequestBody Order order) {
        Order updated = orderService.updateOrder(id, order);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Order> patchOrder(@PathVariable Long id, @RequestBody Map<String, Object> fields) {
        Order patched = orderService.patchOrder(id, fields);
        return patched != null ? ResponseEntity.ok(patched) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        return orderService.deleteOrder(id) ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }
}