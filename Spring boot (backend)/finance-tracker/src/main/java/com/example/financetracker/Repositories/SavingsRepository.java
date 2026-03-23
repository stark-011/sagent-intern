package com.example.financetracker.Repositories;

import com.example.financetracker.entity.Savings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SavingsRepository extends JpaRepository<Savings, Integer> {
    // Find all savings records for a specific user
    List<Savings> findByUserUserId(Integer userId);
}