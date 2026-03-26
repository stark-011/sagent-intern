package com.parkingfinder.backend.service;

import com.parkingfinder.backend.dto.wallet.WalletResponse;
import com.parkingfinder.backend.dto.wallet.WalletTopUpRequest;
import com.parkingfinder.backend.dto.wallet.WalletTransactionResponse;
import com.parkingfinder.backend.dto.wallet.WalletWithdrawRequest;
import java.math.BigDecimal;
import java.util.List;

/**
 * Wallet operations: view balance, list transactions, top-up credits,
 * withdraw earnings, and programmatic debit/credit (used internally by bookings).
 */
public interface WalletService {

    /** Current user's wallet balance. */
    WalletResponse getMyWallet();

    /** Transaction history for the current user, optionally filtered by type. */
    List<WalletTransactionResponse> getMyTransactions(String type);

    /** Add credits to the current user's wallet. */
    WalletResponse topUp(WalletTopUpRequest request);

    /** Withdraw earnings (lender-only). */
    WalletResponse withdraw(WalletWithdrawRequest request);

    /** Programmatic debit (e.g. booking payment). */
    void debit(String userId, BigDecimal amount, String referenceType, String referenceId, String description);

    /** Programmatic credit (e.g. cancellation refund). */
    void credit(String userId, BigDecimal amount, String referenceType, String referenceId, String description);
}
