package com.grocery.groceryapp.Service;

import com.grocery.groceryapp.Entity.Cart;
import com.grocery.groceryapp.Repository.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    public Cart createCart(Cart cart) {
        // Initialize total to 0 if null
        if (cart.getTotal() == null) {
            cart.setTotal(0);
        }
        return cartRepository.save(cart);
    }

    public List<Cart> getAllCarts() {
        return cartRepository.findAll();
    }

    public Optional<Cart> getCartById(Long id) {
        return cartRepository.findById(id);
    }

    // This method recalculates the total based on items
    public Cart refreshCartTotal(Long cartId) {
        Optional<Cart> cartOptional = cartRepository.findById(cartId);
        if (cartOptional.isPresent()) {
            Cart cart = cartOptional.get();
            int total = cart.getCartItems().stream()
                    .mapToInt(item -> item.getProduct().getPrice() * item.getQuantity())
                    .sum();
            cart.setTotal(total);
            return cartRepository.save(cart);
        }
        return null;
    }

    public boolean deleteCart(Long id) {
        if (cartRepository.existsById(id)) {
            cartRepository.deleteById(id);
            return true;
        }
        return false;
    }
}