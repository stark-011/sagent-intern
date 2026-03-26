package com.parkingfinder.backend.repository;

import com.parkingfinder.backend.entity.WalletTransaction;
import com.parkingfinder.backend.enums.ReferenceType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, String> {

    @Query("select t from WalletTransaction t where t.wallet.user.userId = :userId order by t.createdAt desc")
    List<WalletTransaction> findByUserIdOrderByCreatedAtDesc(@Param("userId") String userId);

    Optional<WalletTransaction> findTopByReferenceTypeAndReferenceIdOrderByCreatedAtDesc(ReferenceType referenceType, String referenceId);
}
