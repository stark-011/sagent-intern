package com.grocery.groceryapp.Service;

import com.grocery.groceryapp.Entity.Cart;
import com.grocery.groceryapp.Entity.Order;
import com.grocery.groceryapp.Entity.Store;
import com.grocery.groceryapp.Entity.User;
import com.grocery.groceryapp.Repository.CartRepository;
import com.grocery.groceryapp.Repository.OrderRepository;
import com.grocery.groceryapp.Repository.StoreRepository;
import com.grocery.groceryapp.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.ReflectionUtils;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private StoreRepository storeRepository;
    @Autowired
    private CartRepository cartRepository;

    public Order createOrder(Long userId, Long storeId, Long cartId, String address) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Store store = storeRepository.findById(storeId).orElseThrow(() -> new RuntimeException("Store not found"));
        Cart cart = cartRepository.findById(cartId).orElseThrow(() -> new RuntimeException("Cart not found"));

        Order order = new Order();
        order.setUser(user);
        order.setStore(store);
        order.setCart(cart);
        order.setDeliveryAddress(address);
        order.setTotalAmount(cart.getTotal()); // Copy total from cart

        return orderRepository.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    // Full Update
    public Order updateOrder(Long id, Order orderDetails) {
        return orderRepository.findById(id).map(order -> {
            order.setStatus(orderDetails.getStatus());
            order.setDeliveryAddress(orderDetails.getDeliveryAddress());
            order.setTotalAmount(orderDetails.getTotalAmount());
            return orderRepository.save(order);
        }).orElse(null);
    }

    // Partial Update (Patch)
    public Order patchOrder(Long id, Map<String, Object> fields) {
        Optional<Order> orderOptional = orderRepository.findById(id);
        if (orderOptional.isPresent()) {
            Order order = orderOptional.get();
            fields.forEach((key, value) -> {
                Field field = ReflectionUtils.findField(Order.class, key);
                if (field != null) {
                    field.setAccessible(true);
                    ReflectionUtils.setField(field, order, value);
                }
            });
            return orderRepository.save(order);
        }
        return null;
    }

    public boolean deleteOrder(Long id) {
        if (orderRepository.existsById(id)) {
            orderRepository.deleteById(id);
            return true;
        }
        return false;
    }
}