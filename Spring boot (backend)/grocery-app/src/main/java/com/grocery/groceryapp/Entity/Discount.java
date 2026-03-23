package com.grocery.groceryapp.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "discount")
public class Discount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long discountId;

    private String offerName;
    private Integer amount;
    private Integer minCartValue;

    // Constructors
    public Discount() {}

    public Discount(String offerName, Integer amount, Integer minCartValue) {
        this.offerName = offerName;
        this.amount = amount;
        this.minCartValue = minCartValue;
    }

    // Getters and Setters
    public Long getDiscountId() { return discountId; }
    public void setDiscountId(Long discountId) { this.discountId = discountId; }

    public String getOfferName() { return offerName; }
    public void setOfferName(String offerName) { this.offerName = offerName; }

    public Integer getAmount() { return amount; }
    public void setAmount(Integer amount) { this.amount = amount; }

    public Integer getMinCartValue() { return minCartValue; }
    public void setMinCartValue(Integer minCartValue) { this.minCartValue = minCartValue; }
}