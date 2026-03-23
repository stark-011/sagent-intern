package com.example.financetracker.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer catId;

    private String catName;
    private Double limitAmount;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "category")
    private List<Expense> expenses;

    // TODO: Generate Getters, Setters, Constructors
}