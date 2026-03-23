package com.grocery.groceryapp.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "product")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    private String name;
    private String category;
    private String details;
    private Integer price;
    private Integer stockAvail;

    public Product() {}

    public Product(String name, String category, String details, Integer price, Integer stockAvail) {
        this.name = name;
        this.category = category;
        this.details = details;
        this.price = price;
        this.stockAvail = stockAvail;
    }

    // Getters and Setters
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public Integer getPrice() { return price; }
    public void setPrice(Integer price) { this.price = price; }

    public Integer getStockAvail() { return stockAvail; }
    public void setStockAvail(Integer stockAvail) { this.stockAvail = stockAvail; }
}