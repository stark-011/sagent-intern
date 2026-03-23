package com.example.financetracker.Repositories;

import com.example.financetracker.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {
    // Find all categories created by a specific user
    List<Category> findByUserUserId(Integer userId);
}