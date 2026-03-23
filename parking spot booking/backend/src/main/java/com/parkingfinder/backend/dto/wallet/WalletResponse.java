package com.parkingfinder.backend.dto.wallet;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WalletResponse {
    private String walletId;
    private String userId;
    private BigDecimal creditBalance;
    private String walletStatus;
    private LocalDateTime updatedAt;
}
