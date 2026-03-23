package com.grocery.groceryapp.Service;

import com.grocery.groceryapp.Entity.Product;
import com.grocery.groceryapp.Repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.ReflectionUtils;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public Product updateProduct(Long id, Product productDetails) {
        return productRepository.findById(id).map(product -> {
            product.setName(productDetails.getName());
            product.setCategory(productDetails.getCategory());
            product.setDetails(productDetails.getDetails());
            product.setPrice(productDetails.getPrice());
            product.setStockAvail(productDetails.getStockAvail());
            return productRepository.save(product);
        }).orElse(null);
    }

    public Product patchProduct(Long id, Map<String, Object> fields) {
        Optional<Product> productOptional = productRepository.findById(id);
        if (productOptional.isPresent()) {
            Product product = productOptional.get();
            fields.forEach((key, value) -> {
                Field field = ReflectionUtils.findField(Product.class, key);
                if (field != null) {
                    field.setAccessible(true);
                    ReflectionUtils.setField(field, product, value);
                }
            });
            return productRepository.save(product);
        }
        return null;
    }

    public boolean deleteProduct(Long id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return true;
        }
        return false;
    }
}