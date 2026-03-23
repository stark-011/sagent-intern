package com.example.financetracker.Repositories;

import com.example.financetracker.entity.Income;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncomeRepository extends JpaRepository<Income, Integer> {
    // Custom query to find all incomes for a specific user
    List<Income> findByUserUserId(Integer userId);
}