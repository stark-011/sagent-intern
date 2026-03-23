package com.example.financetracker.controller;

import com.example.financetracker.entity.Expense;
import com.example.financetracker.Service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @PostMapping
    public Expense createExpense(@RequestBody Expense expense) {
        return expenseService.saveExpense(expense);
    }

    @GetMapping
    public List<Expense> getAllExpenses() {
        return expenseService.getAllExpenses();
    }

    @GetMapping("/{id}")
    public Optional<Expense> getExpenseById(@PathVariable Integer id) {
        return expenseService.getExpenseById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteExpense(@PathVariable Integer id) {
        expenseService.deleteExpense(id);
    }
}