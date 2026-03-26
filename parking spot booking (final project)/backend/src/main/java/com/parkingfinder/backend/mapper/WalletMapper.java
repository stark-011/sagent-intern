package com.parkingfinder.backend.mapper;

import com.parkingfinder.backend.dto.wallet.WalletResponse;
import com.parkingfinder.backend.dto.wallet.WalletTransactionResponse;
import com.parkingfinder.backend.entity.WalletAccount;
import com.parkingfinder.backend.entity.WalletTransaction;
import org.springframework.stereotype.Component;

@Component
public class WalletMapper {

    public WalletResponse toDto(WalletAccount wallet) {
        if (wallet == null) {
            return null;
        }
        return WalletResponse.builder()
            .walletId(wallet.getWalletId())
            .userId(wallet.getUser().getUserId())
            .creditBalance(wallet.getCreditBalance())
            .walletStatus(wallet.getWalletStatus().getValue())
            .updatedAt(wallet.getUpdatedAt())
            .build();
    }

    public WalletTransactionResponse toDto(WalletTransaction txn) {
        if (txn == null) {
            return null;
        }
        return WalletTransactionResponse.builder()
            .walletTxnId(txn.getWalletTxnId())
            .walletId(txn.getWallet().getWalletId())
            .userId(txn.getWallet().getUser().getUserId())
            .txnType(txn.getTransactionType().getValue())
            .amount(txn.getAmount())
            .description(txn.getDescription())
            .referenceId(txn.getReferenceId())
            .referenceType(txn.getReferenceType().getValue())
            .transactionStatus(txn.getTransactionStatus().getValue())
            .createdAt(txn.getCreatedAt())
            .build();
    }
}
