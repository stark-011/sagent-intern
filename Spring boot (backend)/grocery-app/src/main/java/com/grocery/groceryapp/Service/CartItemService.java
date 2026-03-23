package com.grocery.groceryapp.Service;

import com.grocery.groceryapp.Entity.Cart;
import com.grocery.groceryapp.Entity.CartItem;
import com.grocery.groceryapp.Entity.Product;
import com.grocery.groceryapp.Repository.CartItemRepository;
import com.grocery.groceryapp.Repository.CartRepository;
import com.grocery.groceryapp.Repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.ReflectionUtils;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CartItemService {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartRepository cartRepository;

    public CartItem createCartItem(Long cartId, Long productId, Integer quantity) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        CartItem item = new CartItem();
        item.setCart(cart);
        item.setProduct(product);
        item.setQuantity(quantity);

        return cartItemRepository.save(item);
    }

    public List<CartItem> getAllCartItems() {
        return cartItemRepository.findAll();
    }

    public Optional<CartItem> getCartItemById(Long id) {
        return cartItemRepository.findById(id);
    }

    public CartItem updateCartItemQuantity(Long id, Integer quantity) {
        return cartItemRepository.findById(id).map(item -> {
            item.setQuantity(quantity);
            return cartItemRepository.save(item);
        }).orElse(null);
    }

    public CartItem patchCartItem(Long id, Map<String, Object> fields) {
        Optional<CartItem> itemOptional = cartItemRepository.findById(id);
        if (itemOptional.isPresent()) {
            CartItem item = itemOptional.get();
            fields.forEach((key, value) -> {
                Field field = ReflectionUtils.findField(CartItem.class, key);
                if (field != null) {
                    field.setAccessible(true);
                    ReflectionUtils.setField(field, item, value);
                }
            });
            return cartItemRepository.save(item);
        }
        return null;
    }

    public boolean deleteCartItem(Long id) {
        if (cartItemRepository.existsById(id)) {
            cartItemRepository.deleteById(id);
            return true;
        }
        return false;
    }
}