package com.grocery.groceryapp.Entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cart")
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cartId;

    private Integer total;

    // A cart belongs to one user
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    // A cart has many items
    // "mappedBy" tells Hibernate that the "cart" field in CartItem owns the relationship
    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CartItem> cartItems = new ArrayList<>();

    // Constructor
    public Cart() {
        this.total = 0;
    }

    // Getters and Setters
    public Long getCartId() { return cartId; }
    public void setCartId(Long cartId) { this.cartId = cartId; }

    public Integer getTotal() { return total; }
    public void setTotal(Integer total) { this.total = total; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public List<CartItem> getCartItems() { return cartItems; }
    public void setCartItems(List<CartItem> cartItems) { this.cartItems = cartItems; }
}