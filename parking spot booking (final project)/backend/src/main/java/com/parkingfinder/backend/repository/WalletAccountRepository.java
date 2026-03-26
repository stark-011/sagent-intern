package com.parkingfinder.backend.repository;

import com.parkingfinder.backend.entity.WalletAccount;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WalletAccountRepository extends JpaRepository<WalletAccount, String> {

    Optional<WalletAccount> findByUserUserId(String userId);
}
