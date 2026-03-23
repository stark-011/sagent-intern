package com.grocery.groceryapp.Service;

import com.grocery.groceryapp.Entity.Discount;
import com.grocery.groceryapp.Repository.DiscountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.ReflectionUtils;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class DiscountService {

    @Autowired
    private DiscountRepository discountRepository;

    public Discount createDiscount(Discount discount) {
        return discountRepository.save(discount);
    }

    public List<Discount> getAllDiscounts() {
        return discountRepository.findAll();
    }

    public Optional<Discount> getDiscountById(Long id) {
        return discountRepository.findById(id);
    }

    public Discount updateDiscount(Long id, Discount discountDetails) {
        return discountRepository.findById(id).map(discount -> {
            discount.setOfferName(discountDetails.getOfferName());
            discount.setAmount(discountDetails.getAmount());
            discount.setMinCartValue(discountDetails.getMinCartValue());
            return discountRepository.save(discount);
        }).orElse(null);
    }

    public Discount patchDiscount(Long id, Map<String, Object> fields) {
        Optional<Discount> discountOptional = discountRepository.findById(id);
        if (discountOptional.isPresent()) {
            Discount discount = discountOptional.get();
            fields.forEach((key, value) -> {
                Field field = ReflectionUtils.findField(Discount.class, key);
                if (field != null) {
                    field.setAccessible(true);
                    ReflectionUtils.setField(field, discount, value);
                }
            });
            return discountRepository.save(discount);
        }
        return null;
    }

    public boolean deleteDiscount(Long id) {
        if (discountRepository.existsById(id)) {
            discountRepository.deleteById(id);
            return true;
        }
        return false;
    }
}