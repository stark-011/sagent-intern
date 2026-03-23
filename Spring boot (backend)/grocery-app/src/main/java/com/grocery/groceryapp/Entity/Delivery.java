package com.grocery.groceryapp.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "delivery")
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long deliveryId;

    private String deliveryPersonName;
    private String status; // "OUT_FOR_DELIVERY", "DELIVERED"
    private String trackingUrl;

    @OneToOne
    @JoinColumn(name = "order_id")
    private Order order;

    public Delivery() {}

    // Getters and Setters
    public Long getDeliveryId() { return deliveryId; }
    public void setDeliveryId(Long deliveryId) { this.deliveryId = deliveryId; }

    public String getDeliveryPersonName() { return deliveryPersonName; }
    public void setDeliveryPersonName(String deliveryPersonName) { this.deliveryPersonName = deliveryPersonName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTrackingUrl() { return trackingUrl; }
    public void setTrackingUrl(String trackingUrl) { this.trackingUrl = trackingUrl; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
}