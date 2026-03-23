package com.example.financetracker.Service;

import com.example.financetracker.entity.Income;
import com.example.financetracker.Repositories.IncomeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class IncomeService {

    @Autowired
    private IncomeRepository incomeRepository;

    public Income saveIncome(Income income) {
        return incomeRepository.save(income);
    }

    public List<Income> getAllIncomes() {
        return incomeRepository.findAll();
    }

    public Optional<Income> getIncomeById(Integer id) {
        return incomeRepository.findById(id);
    }

    public void deleteIncome(Integer id) {
        incomeRepository.deleteById(id);
    }
}