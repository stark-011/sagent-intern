package com.example.financetracker.controller;

import com.example.financetracker.entity.Savings;
import com.example.financetracker.Service.SavingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/savings")
public class SavingsController {

    @Autowired
    private SavingsService savingsService;

    @PostMapping
    public Savings createSavings(@RequestBody Savings savings) {
        return savingsService.saveSavings(savings);
    }

    @GetMapping
    public List<Savings> getAllSavings() {
        return savingsService.getAllSavings();
    }

    @GetMapping("/{id}")
    public Optional<Savings> getSavingsById(@PathVariable Integer id) {
        return savingsService.getSavingsById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteSavings(@PathVariable Integer id) {
        savingsService.deleteSavings(id);
    }
}