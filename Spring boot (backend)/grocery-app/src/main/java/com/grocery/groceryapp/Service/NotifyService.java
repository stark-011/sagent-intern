package com.grocery.groceryapp.Service;

import com.grocery.groceryapp.Entity.Notify;
import com.grocery.groceryapp.Entity.Order;
import com.grocery.groceryapp.Entity.User;
import com.grocery.groceryapp.Repository.NotifyRepository;
import com.grocery.groceryapp.Repository.OrderRepository;
import com.grocery.groceryapp.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.ReflectionUtils;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class NotifyService {

    @Autowired
    private NotifyRepository notifyRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private OrderRepository orderRepository;

    public Notify createNotification(Long userId, Long orderId, String message) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Order is optional in notification (sometimes it's just a general alert)
        Order order = null;
        if (orderId != null) {
            order = orderRepository.findById(orderId).orElse(null);
        }

        Notify notify = new Notify();
        notify.setUser(user);
        notify.setOrder(order);
        notify.setMessage(message);

        return notifyRepository.save(notify);
    }

    public List<Notify> getAllNotifications() {
        return notifyRepository.findAll();
    }

    public Optional<Notify> getNotificationById(Long id) {
        return notifyRepository.findById(id);
    }

    public Notify updateNotification(Long id, Notify details) {
        return notifyRepository.findById(id).map(notify -> {
            notify.setMessage(details.getMessage());
            return notifyRepository.save(notify);
        }).orElse(null);
    }

    public Notify patchNotification(Long id, Map<String, Object> fields) {
        Optional<Notify> notifyOptional = notifyRepository.findById(id);
        if (notifyOptional.isPresent()) {
            Notify notify = notifyOptional.get();
            fields.forEach((key, value) -> {
                Field field = ReflectionUtils.findField(Notify.class, key);
                if (field != null) {
                    field.setAccessible(true);
                    ReflectionUtils.setField(field, notify, value);
                }
            });
            return notifyRepository.save(notify);
        }
        return null;
    }

    public boolean deleteNotification(Long id) {
        if (notifyRepository.existsById(id)) {
            notifyRepository.deleteById(id);
            return true;
        }
        return false;
    }
}