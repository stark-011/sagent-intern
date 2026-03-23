package com.grocery.groceryapp.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    private Integer amount;
    private String status; // "SUCCESS", "FAILED", "PENDING"
    private String method; // "UPI", "CARD", "COD"
    private String receipt; // UUID or Transaction ID
    private LocalDateTime transactionTime;

    @OneToOne
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public Payment() {
        this.transactionTime = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getPaymentId() { return paymentId; }
    public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }

    public Integer getAmount() { return amount; }
    public void setAmount(Integer amount) { this.amount = amount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }

    public String getReceipt() { return receipt; }
    public void setReceipt(String receipt) { this.receipt = receipt; }

    public LocalDateTime getTransactionTime() { return transactionTime; }
    public void setTransactionTime(LocalDateTime transactionTime) { this.transactionTime = transactionTime; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}