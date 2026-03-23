package com.example.financetracker.Service;

import com.example.financetracker.entity.Balance;
import com.example.financetracker.Repositories.BalanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BalanceService {

    @Autowired
    private BalanceRepository balanceRepository;

    public Balance saveBalance(Balance balance) {
        return balanceRepository.save(balance);
    }

    public List<Balance> getAllBalances() {
        return balanceRepository.findAll();
    }

    public Optional<Balance> getBalanceById(Integer id) {
        return balanceRepository.findById(id);
    }

    public Balance updateBalance(Integer id, Balance balanceDetails) {
        return balanceRepository.findById(id).map(balance -> {
            balance.setAmount(balanceDetails.getAmount());
            balance.setUser(balanceDetails.getUser());
            return balanceRepository.save(balance);
        }).orElse(null);
    }

    public void deleteBalance(Integer id) {
        balanceRepository.deleteById(id);
    }
}