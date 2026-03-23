package com.grocery.groceryapp.Service;

import com.grocery.groceryapp.Entity.Store;
import com.grocery.groceryapp.Repository.StoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.ReflectionUtils;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class StoreService {

    @Autowired
    private StoreRepository storeRepository;

    public Store createStore(Store store) {
        return storeRepository.save(store);
    }

    public List<Store> getAllStores() {
        return storeRepository.findAll();
    }

    public Optional<Store> getStoreById(Long id) {
        return storeRepository.findById(id);
    }

    public Store updateStore(Long id, Store storeDetails) {
        return storeRepository.findById(id).map(store -> {
            store.setName(storeDetails.getName());
            store.setLocation(storeDetails.getLocation());
            store.setStatus(storeDetails.getStatus());
            return storeRepository.save(store);
        }).orElse(null);
    }

    public Store patchStore(Long id, Map<String, Object> fields) {
        Optional<Store> storeOptional = storeRepository.findById(id);
        if (storeOptional.isPresent()) {
            Store store = storeOptional.get();
            fields.forEach((key, value) -> {
                Field field = ReflectionUtils.findField(Store.class, key);
                if (field != null) {
                    field.setAccessible(true);
                    ReflectionUtils.setField(field, store, value);
                }
            });
            return storeRepository.save(store);
        }
        return null;
    }

    public boolean deleteStore(Long id) {
        if (storeRepository.existsById(id)) {
            storeRepository.deleteById(id);
            return true;
        }
        return false;
    }
}