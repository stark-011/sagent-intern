package com.grocery.groceryapp.Controller;

import com.grocery.groceryapp.Entity.Discount;
import com.grocery.groceryapp.Service.DiscountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/discounts")
public class DiscountController {

    @Autowired
    private DiscountService discountService;

    @PostMapping
    public ResponseEntity<Discount> createDiscount(@RequestBody Discount discount) {
        return ResponseEntity.ok(discountService.createDiscount(discount));
    }

    @GetMapping
    public List<Discount> getAllDiscounts() {
        return discountService.getAllDiscounts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Discount> getDiscountById(@PathVariable Long id) {
        return discountService.getDiscountById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Discount> updateDiscount(@PathVariable Long id, @RequestBody Discount discount) {
        Discount updated = discountService.updateDiscount(id, discount);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Discount> patchDiscount(@PathVariable Long id, @RequestBody Map<String, Object> fields) {
        Discount patched = discountService.patchDiscount(id, fields);
        return patched != null ? ResponseEntity.ok(patched) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDiscount(@PathVariable Long id) {
        return discountService.deleteDiscount(id) ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }
}