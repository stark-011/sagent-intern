package com.grocery.groceryapp.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notify")
public class Notify {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notifyId;

    private String message;
    private LocalDateTime sentAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    public Notify() {
        this.sentAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getNotifyId() { return notifyId; }
    public void setNotifyId(Long notifyId) { this.notifyId = notifyId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
}