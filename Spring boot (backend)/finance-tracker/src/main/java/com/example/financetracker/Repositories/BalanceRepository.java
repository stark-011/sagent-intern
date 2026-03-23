package com.example.financetracker.Repositories;

import com.example.financetracker.entity.Balance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BalanceRepository extends JpaRepository<Balance, Integer> {
    // Find balance record for a specific user
    // Assuming a user might have one main balance record, or a list if multiple accounts
    Optional<Balance> findByUserUserId(Integer userId);
}