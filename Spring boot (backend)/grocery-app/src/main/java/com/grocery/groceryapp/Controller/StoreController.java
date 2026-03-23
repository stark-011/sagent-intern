package com.grocery.groceryapp.Controller;

import com.grocery.groceryapp.Entity.Store;
import com.grocery.groceryapp.Service.StoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stores")
public class StoreController {

    @Autowired
    private StoreService storeService;

    @PostMapping
    public ResponseEntity<Store> createStore(@RequestBody Store store) {
        return ResponseEntity.ok(storeService.createStore(store));
    }

    @GetMapping
    public List<Store> getAllStores() {
        return storeService.getAllStores();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Store> getStoreById(@PathVariable Long id) {
        return storeService.getStoreById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Store> updateStore(@PathVariable Long id, @RequestBody Store store) {
        Store updated = storeService.updateStore(id, store);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Store> patchStore(@PathVariable Long id, @RequestBody Map<String, Object> fields) {
        Store patched = storeService.patchStore(id, fields);
        return patched != null ? ResponseEntity.ok(patched) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStore(@PathVariable Long id) {
        return storeService.deleteStore(id) ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }
}