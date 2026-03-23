package com.example.financetracker.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users") // 'User' is a reserved keyword in SQL, so we use 'users'
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userId;

    private String name;

    @Column(unique = true)
    private String email;

    private String password;

    private LocalDateTime createdAt;

    // Relationships
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Income> incomes;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Expense> expenses;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Savings> savings;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Category> categories;

    // Assuming a user can have multiple balance accounts (Bank, Cash, etc.)
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Balance> balances;

    // TODO: Generate Getters, Setters, No-Args Constructor, All-Args Constructor here
}