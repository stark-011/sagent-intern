package com.parkingfinder.backend.controller;

import com.parkingfinder.backend.dto.common.ApiResponse;
import com.parkingfinder.backend.dto.wallet.WalletResponse;
import com.parkingfinder.backend.dto.wallet.WalletTopUpRequest;
import com.parkingfinder.backend.dto.wallet.WalletTransactionResponse;
import com.parkingfinder.backend.dto.wallet.WalletWithdrawRequest;
import com.parkingfinder.backend.service.WalletService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @GetMapping
    public ResponseEntity<ApiResponse<WalletResponse>> getWallet() {
        return ResponseEntity.ok(ApiResponse.ok("Wallet fetched", walletService.getMyWallet()));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<WalletTransactionResponse>>> transactions(
        @RequestParam(name = "type", defaultValue = "all") String type
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Transactions fetched", walletService.getMyTransactions(type)));
    }

    @PostMapping("/top-up")
    public ResponseEntity<ApiResponse<WalletResponse>> topUp(@Valid @RequestBody WalletTopUpRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Wallet topped up", walletService.topUp(request)));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<ApiResponse<WalletResponse>> withdraw(@Valid @RequestBody WalletWithdrawRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Withdrawal successful", walletService.withdraw(request)));
    }
}
