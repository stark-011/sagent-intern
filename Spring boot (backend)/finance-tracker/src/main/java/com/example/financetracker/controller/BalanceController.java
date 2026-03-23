package com.example.financetracker.controller;

import com.example.financetracker.entity.Balance;
import com.example.financetracker.Service.BalanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/balances")
public class BalanceController {

    @Autowired
    private BalanceService balanceService;

    // Usually Balance is updated automatically, but this endpoint allows manual creation/initialization
    @PostMapping
    public Balance createBalance(@RequestBody Balance balance) {
        return balanceService.saveBalance(balance);
    }

    @GetMapping
    public List<Balance> getAllBalances() {
        return balanceService.getAllBalances();
    }

    @GetMapping("/{id}")
    public Optional<Balance> getBalanceById(@PathVariable Integer id) {
        return balanceService.getBalanceById(id);
    }

    // Endpoint to update balance specifically (e.g., manual adjustment)
    @PutMapping("/{id}")
    public Balance updateBalance(@PathVariable Integer id, @RequestBody Balance balanceDetails) {
        return balanceService.updateBalance(id, balanceDetails);
    }

    @DeleteMapping("/{id}")
    public void deleteBalance(@PathVariable Integer id) {
        balanceService.deleteBalance(id);
    }
}