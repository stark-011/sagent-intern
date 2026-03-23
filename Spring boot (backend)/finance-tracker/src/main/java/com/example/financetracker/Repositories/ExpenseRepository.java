package com.example.financetracker.Repositories;

import com.example.financetracker.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Integer> {
    // Find all expenses for a specific user
    List<Expense> findByUserUserId(Integer userId);

    // Find all expenses for a specific category
    List<Expense> findByCategoryCatId(Integer catId);
}