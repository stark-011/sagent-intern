package com.parkingfinder.backend.repository;

import com.parkingfinder.backend.entity.OtpResetToken;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface OtpResetTokenRepository extends JpaRepository<OtpResetToken, String> {

    /** Find the latest unused, non-expired OTP for a given email. */
    Optional<OtpResetToken> findTopByEmailIgnoreCaseAndUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
        String email, LocalDateTime now);

    /** Invalidate all unused tokens for an email (called before issuing a new one). */
    @Modifying
    @Query("UPDATE OtpResetToken t SET t.used = true WHERE t.email = :email AND t.used = false")
    void invalidateAllByEmail(String email);
}
