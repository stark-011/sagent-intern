package com.grocery.groceryapp.Controller;

import com.grocery.groceryapp.Entity.CartItem;
import com.grocery.groceryapp.Service.CartItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart-items")
public class CartItemController {

    @Autowired
    private CartItemService cartItemService;

    // Helper class to receive JSON data
    public static class CartItemRequest {
        public Long cartId;
        public Long productId;
        public Integer quantity;
    }

    @PostMapping
    public ResponseEntity<CartItem> addItemToCart(@RequestBody CartItemRequest request) {
        CartItem newItem = cartItemService.createCartItem(
                request.cartId,
                request.productId,
                request.quantity
        );
        return ResponseEntity.ok(newItem);
    }

    @GetMapping
    public List<CartItem> getAllCartItems() {
        return cartItemService.getAllCartItems();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CartItem> getCartItemById(@PathVariable Long id) {
        return cartItemService.getCartItemById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<CartItem> updateQuantity(@PathVariable Long id, @RequestBody Map<String, Integer> payload) {
        // Expects JSON: { "quantity": 5 }
        Integer quantity = payload.get("quantity");
        CartItem updated = cartItemService.updateCartItemQuantity(id, quantity);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<CartItem> patchCartItem(@PathVariable Long id, @RequestBody Map<String, Object> fields) {
        CartItem patched = cartItemService.patchCartItem(id, fields);
        return patched != null ? ResponseEntity.ok(patched) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCartItem(@PathVariable Long id) {
        return cartItemService.deleteCartItem(id) ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }
}