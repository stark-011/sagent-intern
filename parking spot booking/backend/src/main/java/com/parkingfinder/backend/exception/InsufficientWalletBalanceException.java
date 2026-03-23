package com.parkingfinder.backend.exception;

import org.springframework.http.HttpStatus;

public class InsufficientWalletBalanceException extends ApiException {
    public InsufficientWalletBalanceException(String message) {
        super(HttpStatus.CONFLICT, "INSUFFICIENT_WALLET_BALANCE", message);
    }
}
