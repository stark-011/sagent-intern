package com.college.admission.controller;

import com.college.admission.model.FeesPayment;
import com.college.admission.service.FeesPaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin("*")
public class FeesPaymentController {

    @Autowired
    private FeesPaymentService service;

    // CREATE (Make Payment)
    @PostMapping
    public FeesPayment makePayment(@RequestBody FeesPayment payment) {
        return service.processPayment(payment);
    }

    // READ (All)
    @GetMapping
    public List<FeesPayment> getAllPayments() {
        return service.getAllPayments();
    }

    // READ (One)
    @GetMapping("/{id}")
    public FeesPayment getPaymentById(@PathVariable Long id) {
        return service.getPaymentById(id);
    }

    // UPDATE (Retry failed payment)
    @PutMapping("/{id}")
    public FeesPayment updatePayment(@PathVariable Long id, @RequestBody FeesPayment paymentDetails) {
        FeesPayment payment = service.getPaymentById(id);
        if (payment != null) {
            payment.setStatus(paymentDetails.getStatus());
            payment.setPayMethod(paymentDetails.getPayMethod());
            return service.processPayment(payment);
        }
        return null;
    }

    // DELETE (Refund/Cancel)
    @DeleteMapping("/{id}")
    public String deletePayment(@PathVariable Long id) {
        service.deletePayment(id);
        return "Payment record deleted";
    }
}