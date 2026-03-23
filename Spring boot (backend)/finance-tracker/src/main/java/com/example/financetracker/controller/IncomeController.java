package com.example.financetracker.controller;

import com.example.financetracker.entity.Income;
import com.example.financetracker.Service.IncomeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/incomes")
public class IncomeController {

    @Autowired
    private IncomeService incomeService;

    @PostMapping
    public Income createIncome(@RequestBody Income income) {
        return incomeService.saveIncome(income);
    }

    @GetMapping
    public List<Income> getAllIncomes() {
        return incomeService.getAllIncomes();
    }

    @GetMapping("/{id}")
    public Optional<Income> getIncomeById(@PathVariable Integer id) {
        return incomeService.getIncomeById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteIncome(@PathVariable Integer id) {
        incomeService.deleteIncome(id);
    }
}