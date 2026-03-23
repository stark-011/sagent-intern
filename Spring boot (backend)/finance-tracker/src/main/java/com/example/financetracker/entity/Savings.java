package com.example.financetracker.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Savings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer savingsId;

    private Double amount;
    private LocalDate savingsDate;
    private Double targetAmt;
    private String description;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // TODO: Generate Getters, Setters, Constructors
}