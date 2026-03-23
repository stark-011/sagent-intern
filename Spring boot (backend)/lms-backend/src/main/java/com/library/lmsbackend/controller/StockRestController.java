package com.library.lmsbackend.controller;

import com.library.lmsbackend.model.Stock;
import com.library.lmsbackend.service.StockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock")
public class StockRestController {

    @Autowired
    private StockService stockService;

    @PostMapping
    public Stock createStock(@RequestBody Stock stock) {
        return stockService.saveStock(stock);
    }

    @GetMapping
    public List<Stock> getAllStock() {
        return stockService.getAllStock();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Stock> getStockById(@PathVariable Long id) {
        Stock stock = stockService.getStockById(id);
        return stock != null ? ResponseEntity.ok(stock) : ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Stock> patchStock(@PathVariable Long id, @RequestBody Stock stock) {
        Stock updated = stockService.patchStock(id, stock);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStock(@PathVariable Long id) {
        stockService.deleteStock(id);
        return ResponseEntity.noContent().build();
    }
}