package com.grocery.groceryapp.Controller;

import com.grocery.groceryapp.Entity.Delivery;
import com.grocery.groceryapp.Service.DeliveryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/deliveries")
public class DeliveryController {

    @Autowired
    private DeliveryService deliveryService;

    public static class DeliveryRequest {
        public Long orderId;
        public String personName;
        public String trackingUrl;
    }

    @PostMapping
    public ResponseEntity<Delivery> createDelivery(@RequestBody DeliveryRequest request) {
        Delivery delivery = deliveryService.createDelivery(
                request.orderId,
                request.personName,
                request.trackingUrl
        );
        return ResponseEntity.ok(delivery);
    }

    @GetMapping
    public List<Delivery> getAllDeliveries() {
        return deliveryService.getAllDeliveries();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Delivery> getDeliveryById(@PathVariable Long id) {
        return deliveryService.getDeliveryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Delivery> updateDelivery(@PathVariable Long id, @RequestBody Delivery delivery) {
        Delivery updated = deliveryService.updateDelivery(id, delivery);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Delivery> patchDelivery(@PathVariable Long id, @RequestBody Map<String, Object> fields) {
        Delivery patched = deliveryService.patchDelivery(id, fields);
        return patched != null ? ResponseEntity.ok(patched) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDelivery(@PathVariable Long id) {
        return deliveryService.deleteDelivery(id) ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }
}