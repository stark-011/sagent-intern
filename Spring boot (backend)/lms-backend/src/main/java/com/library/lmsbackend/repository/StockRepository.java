package com.library.lmsbackend.repository;

import com.library.lmsbackend.model.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {
    // You can find books by title:
    // List<Stock> findByTitleContaining(String title);
}