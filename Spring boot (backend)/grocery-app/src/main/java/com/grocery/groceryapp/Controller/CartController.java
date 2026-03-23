package com.grocery.groceryapp.Controller;

import com.grocery.groceryapp.Entity.Cart;
import com.grocery.groceryapp.Service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carts")
public class CartController {

    @Autowired
    private CartService cartService;

    @PostMapping
    public ResponseEntity<Cart> createCart(@RequestBody Cart cart) {
        return ResponseEntity.ok(cartService.createCart(cart));
    }

    @GetMapping
    public List<Cart> getAllCarts() {
        return cartService.getAllCarts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cart> getCartById(@PathVariable Long id) {
        return cartService.getCartById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Use this to force a recalculation of the cart total
    @PutMapping("/{id}/refresh")
    public ResponseEntity<Cart> refreshCartTotal(@PathVariable Long id) {
        Cart updatedCart = cartService.refreshCartTotal(id);
        return updatedCart != null ? ResponseEntity.ok(updatedCart) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCart(@PathVariable Long id) {
        return cartService.deleteCart(id) ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }
}