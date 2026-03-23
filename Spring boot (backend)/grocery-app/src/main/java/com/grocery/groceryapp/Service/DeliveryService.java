package com.grocery.groceryapp.Service;

import com.grocery.groceryapp.Entity.Delivery;
import com.grocery.groceryapp.Entity.Order;
import com.grocery.groceryapp.Repository.DeliveryRepository;
import com.grocery.groceryapp.Repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.ReflectionUtils;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class DeliveryService {

    @Autowired
    private DeliveryRepository deliveryRepository;
    @Autowired
    private OrderRepository orderRepository;

    public Delivery createDelivery(Long orderId, String personName, String trackingUrl) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Delivery delivery = new Delivery();
        delivery.setOrder(order);
        delivery.setDeliveryPersonName(personName);
        delivery.setTrackingUrl(trackingUrl);
        delivery.setStatus("ASSIGNED");

        return deliveryRepository.save(delivery);
    }

    public List<Delivery> getAllDeliveries() {
        return deliveryRepository.findAll();
    }

    public Optional<Delivery> getDeliveryById(Long id) {
        return deliveryRepository.findById(id);
    }

    public Delivery updateDelivery(Long id, Delivery details) {
        return deliveryRepository.findById(id).map(delivery -> {
            delivery.setDeliveryPersonName(details.getDeliveryPersonName());
            delivery.setStatus(details.getStatus());
            delivery.setTrackingUrl(details.getTrackingUrl());
            return deliveryRepository.save(delivery);
        }).orElse(null);
    }

    public Delivery patchDelivery(Long id, Map<String, Object> fields) {
        Optional<Delivery> deliveryOptional = deliveryRepository.findById(id);
        if (deliveryOptional.isPresent()) {
            Delivery delivery = deliveryOptional.get();
            fields.forEach((key, value) -> {
                Field field = ReflectionUtils.findField(Delivery.class, key);
                if (field != null) {
                    field.setAccessible(true);
                    ReflectionUtils.setField(field, delivery, value);
                }
            });
            return deliveryRepository.save(delivery);
        }
        return null;
    }

    public boolean deleteDelivery(Long id) {
        if (deliveryRepository.existsById(id)) {
            deliveryRepository.deleteById(id);
            return true;
        }
        return false;
    }
}