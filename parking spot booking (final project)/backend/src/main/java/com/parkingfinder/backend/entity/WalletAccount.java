package com.parkingfinder.backend.entity;

import com.parkingfinder.backend.enums.WalletStatus;
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
@Table(name = "wallet_accounts", indexes = {
    @Index(name = "idx_wallet_user", columnList = "user_id", unique = true)
})
public class WalletAccount {

    @Id
    @Column(name = "wallet_id", length = 50)
    private String walletId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(name = "credit_balance", nullable = false, precision = 14, scale = 2)
    private BigDecimal creditBalance;

    @Enumerated(EnumType.STRING)
    @Column(name = "wallet_status", nullable = false, length = 32)
    private WalletStatus walletStatus;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
