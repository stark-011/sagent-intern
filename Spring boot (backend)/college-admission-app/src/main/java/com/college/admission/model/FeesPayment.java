package com.college.admission.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class FeesPayment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    @ManyToOne
    @JoinColumn(name = "app_id")
    private Application application;

    private String payMethod; // 'Card', 'UPI'
    private String status;    // 'Success', 'Failed'
    private Double amount;
    private LocalDateTime transactionDate;

    // Getters and Setters
    public Long getPaymentId() { return paymentId; }
    public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }
    public Application getApplication() { return application; }
    public void setApplication(Application application) { this.application = application; }
    public String getPayMethod() { return payMethod; }
    public void setPayMethod(String payMethod) { this.payMethod = payMethod; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public LocalDateTime getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDateTime transactionDate) { this.transactionDate = transactionDate; }
}