package com.example.financetracker.Repositories;

import com.example.financetracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    // You can add custom queries here later, e.g.:
    // User findByEmail(String email);
}