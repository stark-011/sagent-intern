package com.college.admission.service;

import com.college.admission.model.FeesPayment;
import com.college.admission.repository.FeesPaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class FeesPaymentService {

    @Autowired
    private FeesPaymentRepository repo;

    // CREATE & UPDATE
    public FeesPayment processPayment(FeesPayment payment) {
        if (payment.getTransactionDate() == null) {
            payment.setTransactionDate(LocalDateTime.now());
        }
        if (payment.getStatus() == null) {
            payment.setStatus("Success");
        }
        return repo.save(payment);
    }

    // READ (Get All)
    public List<FeesPayment> getAllPayments() {
        return repo.findAll();
    }

    // READ (Get One)
    public FeesPayment getPaymentById(Long id) {
        return repo.findById(id).orElse(null);
    }

    // DELETE
    public void deletePayment(Long id) {
        repo.deleteById(id);
    }
}