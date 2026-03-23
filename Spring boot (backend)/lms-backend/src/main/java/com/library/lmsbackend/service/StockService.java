package com.library.lmsbackend.service;

import com.library.lmsbackend.model.Stock;
import com.library.lmsbackend.repository.StockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class StockService {

    @Autowired
    private StockRepository repository;

    public Stock saveStock(Stock stock) {
        return repository.save(stock);
    }

    public List<Stock> getAllStock() {
        return repository.findAll();
    }

    public Stock getStockById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public void deleteStock(Long id) {
        repository.deleteById(id);
    }

    // PATCH: Update specific fields (e.g., just quantity)
    public Stock patchStock(Long id, Stock partialStock) {
        return repository.findById(id).map(stock -> {
            if (partialStock.getTitle() != null) stock.setTitle(partialStock.getTitle());
            if (partialStock.getAuthor() != null) stock.setAuthor(partialStock.getAuthor());
            if (partialStock.getSubject() != null) stock.setSubject(partialStock.getSubject());
            if (partialStock.getTotalQuantity() != null) stock.setTotalQuantity(partialStock.getTotalQuantity());
            if (partialStock.getAvailableQuantity() != null) stock.setAvailableQuantity(partialStock.getAvailableQuantity());
            if (partialStock.getStatus() != null) stock.setStatus(partialStock.getStatus());
            return repository.save(stock);
        }).orElse(null);
    }
}