package com.grocery.groceryapp.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "users") // "user" is a reserved keyword in SQL
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    private String name;
    private String address;
    private String contact;

    // Constructors
    public User() {}

    public User(String name, String address, String contact) {
        this.name = name;
        this.address = address;
        this.contact = contact;
    }

    // Getters and Setters (No Lombok)
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }
}