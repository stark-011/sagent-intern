package com.parkingfinder.backend.entity;

import com.parkingfinder.backend.enums.ReferenceType;
import com.parkingfinder.backend.enums.TransactionStatus;
import com.parkingfinder.backend.enums.TransactionType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "wallet_transactions", indexes = {
    @Index(name = "idx_wallet_txn_wallet", columnList = "wallet_id"),
    @Index(name = "idx_wallet_txn_reference", columnList = "reference_type,reference_id")
})
public class WalletTransaction {

    @Id
    @Column(name = "wallet_txn_id", length = 50)
    private String walletTxnId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    private WalletAccount wallet;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 32)
    private TransactionType transactionType;

    @Column(name = "amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "reference_type", nullable = false, length = 32)
    private ReferenceType referenceType;

    @Column(name = "reference_id", nullable = false, length = 80)
    private String referenceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_status", nullable = false, length = 32)
    private TransactionStatus transactionStatus;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
