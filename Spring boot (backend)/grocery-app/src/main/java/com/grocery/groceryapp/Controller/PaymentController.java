package com.grocery.groceryapp.Controller;

import com.grocery.groceryapp.Entity.Payment;
import com.grocery.groceryapp.Service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    public static class PaymentRequest {
        public Long orderId;
        public Long userId;
        public String method;
    }

    @PostMapping
    public ResponseEntity<Payment> createPayment(@RequestBody PaymentRequest request) {
        Payment payment = paymentService.createPayment(
                request.orderId,
                request.userId,
                request.method
        );
        return ResponseEntity.ok(payment);
    }

    @GetMapping
    public List<Payment> getAllPayments() {
        return paymentService.getAllPayments();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Long id) {
        return paymentService.getPaymentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Payment> updatePayment(@PathVariable Long id, @RequestBody Payment payment) {
        Payment updated = paymentService.updatePayment(id, payment);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Payment> patchPayment(@PathVariable Long id, @RequestBody Map<String, Object> fields) {
        Payment patched = paymentService.patchPayment(id, fields);
        return patched != null ? ResponseEntity.ok(patched) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id) {
        return paymentService.deletePayment(id) ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }
}