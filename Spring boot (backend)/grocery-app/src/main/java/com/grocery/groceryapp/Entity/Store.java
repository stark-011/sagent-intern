package com.grocery.groceryapp.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "store")
public class Store {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long storeId;

    private String name;
    private String location;
    private String status; // e.g., "OPEN", "CLOSED"

    public Store() {}

    public Store(String name, String location, String status) {
        this.name = name;
        this.location = location;
        this.status = status;
    }

    // Getters and Setters
    public Long getStoreId() { return storeId; }
    public void setStoreId(Long storeId) { this.storeId = storeId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}