package com.parkingfinder.backend.dto.wallet;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WalletTransactionResponse {
    private String walletTxnId;
    private String walletId;
    private String userId;
    private String txnType;
    private BigDecimal amount;
    private String description;
    private String referenceId;
    private String referenceType;
    private String transactionStatus;
    private LocalDateTime createdAt;
}
