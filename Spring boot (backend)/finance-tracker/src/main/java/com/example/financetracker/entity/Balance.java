package com.example.financetracker.entity;

import jakarta.persistence.*;

@Entity
public class Balance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer balanceId;

    private Double amount;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public Integer getBalanceId() {
        return balanceId;
    }

    public void setBalanceId(Integer balanceId) {
        this.balanceId = balanceId;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    // TODO: Generate Getters, Setters, Constructors
}