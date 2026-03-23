package com.grocery.groceryapp.Service;

import com.grocery.groceryapp.Entity.Order;
import com.grocery.groceryapp.Entity.Payment;
import com.grocery.groceryapp.Entity.User;
import com.grocery.groceryapp.Repository.OrderRepository;
import com.grocery.groceryapp.Repository.PaymentRepository;
import com.grocery.groceryapp.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.ReflectionUtils;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private UserRepository userRepository;

    public Payment createPayment(Long orderId, Long userId, String method) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setUser(user);
        payment.setAmount(order.getTotalAmount()); // Auto-fill amount from order
        payment.setMethod(method);
        payment.setStatus("SUCCESS");
        // Generate a random receipt ID
        payment.setReceipt(UUID.randomUUID().toString());

        return paymentRepository.save(payment);
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Optional<Payment> getPaymentById(Long id) {
        return paymentRepository.findById(id);
    }

    public Payment updatePayment(Long id, Payment details) {
        return paymentRepository.findById(id).map(payment -> {
            payment.setStatus(details.getStatus());
            payment.setMethod(details.getMethod());
            payment.setReceipt(details.getReceipt());
            return paymentRepository.save(payment);
        }).orElse(null);
    }

    public Payment patchPayment(Long id, Map<String, Object> fields) {
        Optional<Payment> paymentOptional = paymentRepository.findById(id);
        if (paymentOptional.isPresent()) {
            Payment payment = paymentOptional.get();
            fields.forEach((key, value) -> {
                Field field = ReflectionUtils.findField(Payment.class, key);
                if (field != null) {
                    field.setAccessible(true);
                    ReflectionUtils.setField(field, payment, value);
                }
            });
            return paymentRepository.save(payment);
        }
        return null;
    }

    public boolean deletePayment(Long id) {
        if (paymentRepository.existsById(id)) {
            paymentRepository.deleteById(id);
            return true;
        }
        return false;
    }
}