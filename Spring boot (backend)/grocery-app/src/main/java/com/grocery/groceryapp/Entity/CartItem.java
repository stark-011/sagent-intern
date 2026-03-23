package com.grocery.groceryapp.Entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "cart_item")
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cartItemId;

    private Integer quantity;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne
    @JoinColumn(name = "cart_id")
    @JsonIgnore // Prevents infinite recursion loop in JSON
    private Cart cart;

    public CartItem() {}

    // Getters and Setters
    public Long getCartItemId() { return cartItemId; }
    public void setCartItemId(Long cartItemId) { this.cartItemId = cartItemId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public Cart getCart() { return cart; }
    public void setCart(Cart cart) { this.cart = cart; }
}