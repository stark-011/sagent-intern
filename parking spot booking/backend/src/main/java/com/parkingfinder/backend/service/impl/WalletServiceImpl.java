package com.parkingfinder.backend.service.impl;

import com.parkingfinder.backend.dto.wallet.WalletResponse;
import com.parkingfinder.backend.dto.wallet.WalletTopUpRequest;
import com.parkingfinder.backend.dto.wallet.WalletTransactionResponse;
import com.parkingfinder.backend.dto.wallet.WalletWithdrawRequest;
import com.parkingfinder.backend.entity.AppUser;
import com.parkingfinder.backend.entity.WalletAccount;
import com.parkingfinder.backend.entity.WalletTransaction;
import com.parkingfinder.backend.enums.ReferenceType;
import com.parkingfinder.backend.enums.TransactionStatus;
import com.parkingfinder.backend.enums.TransactionType;
import com.parkingfinder.backend.enums.UserRole;
import com.parkingfinder.backend.enums.WalletStatus;
import com.parkingfinder.backend.exception.ForbiddenException;
import com.parkingfinder.backend.exception.InsufficientWalletBalanceException;
import com.parkingfinder.backend.exception.ResourceNotFoundException;
import com.parkingfinder.backend.mapper.WalletMapper;
import com.parkingfinder.backend.repository.AppUserRepository;
import com.parkingfinder.backend.repository.WalletAccountRepository;
import com.parkingfinder.backend.repository.WalletTransactionRepository;
import com.parkingfinder.backend.service.WalletService;
import com.parkingfinder.backend.util.IdGenerator;
import com.parkingfinder.backend.util.SecurityUtils;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WalletServiceImpl implements WalletService {

    private final WalletAccountRepository walletAccountRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final AppUserRepository appUserRepository;
    private final WalletMapper walletMapper;

    @Override
    public WalletResponse getMyWallet() {
        String userId = SecurityUtils.getCurrentUserId();
        return walletMapper.toDto(getOrCreateWallet(userId));
    }

    @Override
    public List<WalletTransactionResponse> getMyTransactions(String type) {
        String userId = SecurityUtils.getCurrentUserId();
        List<WalletTransaction> list = walletTransactionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (type == null || type.isBlank() || "all".equalsIgnoreCase(type)) {
            return list.stream().map(walletMapper::toDto).toList();
        }

        TransactionType txnType = TransactionType.fromValue(type);
        return list.stream()
            .filter(txn -> txn.getTransactionType() == txnType)
            .map(walletMapper::toDto)
            .toList();
    }

    @Override
    @Transactional
    public WalletResponse topUp(WalletTopUpRequest request) {
        String userId = SecurityUtils.getCurrentUserId();
        credit(userId, request.getAmount(), "topup", IdGenerator.generate("topup"), "Wallet top-up");
        return walletMapper.toDto(getOrCreateWallet(userId));
    }

    @Override
    @Transactional
    public WalletResponse withdraw(WalletWithdrawRequest request) {
        AppUser currentUser = SecurityUtils.getCurrentUserEntity();
        if (currentUser.getRole() != UserRole.LENDER) {
            throw new ForbiddenException("Only lenders can withdraw from wallet");
        }

        debit(
            currentUser.getUserId(),
            request.getAmount(),
            "manual",
            IdGenerator.generate("wd"),
            "Lender withdrawal"
        );
        return walletMapper.toDto(getOrCreateWallet(currentUser.getUserId()));
    }

    @Override
    @Transactional
    public void debit(String userId, BigDecimal amount, String referenceType, String referenceId, String description) {
        WalletAccount wallet = getOrCreateWallet(userId);
        if (wallet.getCreditBalance().compareTo(amount) < 0) {
            throw new InsufficientWalletBalanceException("Insufficient wallet balance");
        }

        wallet.setCreditBalance(wallet.getCreditBalance().subtract(amount));
        wallet.setUpdatedAt(LocalDateTime.now());
        walletAccountRepository.save(wallet);

        walletTransactionRepository.save(WalletTransaction.builder()
            .walletTxnId(IdGenerator.generate("wtxn"))
            .wallet(wallet)
            .transactionType(TransactionType.DEBIT)
            .amount(amount)
            .referenceType(ReferenceType.fromValue(referenceType))
            .referenceId(referenceId)
            .transactionStatus(TransactionStatus.SUCCESS)
            .description(description)
            .createdAt(LocalDateTime.now())
            .build());
    }

    @Override
    @Transactional
    public void credit(String userId, BigDecimal amount, String referenceType, String referenceId, String description) {
        WalletAccount wallet = getOrCreateWallet(userId);
        wallet.setCreditBalance(wallet.getCreditBalance().add(amount));
        wallet.setUpdatedAt(LocalDateTime.now());
        walletAccountRepository.save(wallet);

        walletTransactionRepository.save(WalletTransaction.builder()
            .walletTxnId(IdGenerator.generate("wtxn"))
            .wallet(wallet)
            .transactionType(TransactionType.CREDIT)
            .amount(amount)
            .referenceType(ReferenceType.fromValue(referenceType))
            .referenceId(referenceId)
            .transactionStatus(TransactionStatus.SUCCESS)
            .description(description)
            .createdAt(LocalDateTime.now())
            .build());
    }

    public WalletAccount getOrCreateWallet(String userId) {
        return walletAccountRepository.findByUserUserId(userId)
            .orElseGet(() -> {
                AppUser user = appUserRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                WalletAccount wallet = WalletAccount.builder()
                    .walletId(IdGenerator.generate("wal"))
                    .user(user)
                    .creditBalance(BigDecimal.ZERO.setScale(2))
                    .walletStatus(WalletStatus.ACTIVE)
                    .updatedAt(LocalDateTime.now())
                    .build();
                return walletAccountRepository.save(wallet);
            });
    }
}
