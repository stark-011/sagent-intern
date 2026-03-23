package com.example.financetracker.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer expenseId;

    private String expenseType;
    private Double amount;
    private LocalDate expenseDate;
    private String description;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "cat_id")
    private Category category;

    // TODO: Generate Getters, Setters, Constructors
}