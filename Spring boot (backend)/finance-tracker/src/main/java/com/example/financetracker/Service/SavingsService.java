package com.example.financetracker.Service;

import com.example.financetracker.entity.Savings;
import com.example.financetracker.Repositories.SavingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SavingsService {

    @Autowired
    private SavingsRepository savingsRepository;

    public Savings saveSavings(Savings savings) {
        return savingsRepository.save(savings);
    }

    public List<Savings> getAllSavings() {
        return savingsRepository.findAll();
    }

    public Optional<Savings> getSavingsById(Integer id) {
        return savingsRepository.findById(id);
    }

    public void deleteSavings(Integer id) {
        savingsRepository.deleteById(id);
    }
}