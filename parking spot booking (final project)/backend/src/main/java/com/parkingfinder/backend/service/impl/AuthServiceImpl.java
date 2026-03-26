package com.parkingfinder.backend.service.impl;

import com.parkingfinder.backend.dto.auth.AuthResponse;
import com.parkingfinder.backend.dto.auth.ForgotPasswordResponse;
import com.parkingfinder.backend.dto.auth.LoginRequest;
import com.parkingfinder.backend.dto.auth.RegisterRequest;
import com.parkingfinder.backend.dto.auth.ResetPasswordRequest;
import com.parkingfinder.backend.dto.auth.VerifyOtpRequest;
import com.parkingfinder.backend.dto.user.UserResponse;
import com.parkingfinder.backend.dto.wallet.WalletResponse;
import com.parkingfinder.backend.entity.AppUser;
import com.parkingfinder.backend.entity.OtpResetToken;
import com.parkingfinder.backend.entity.WalletAccount;
import com.parkingfinder.backend.enums.AccountStatus;
import com.parkingfinder.backend.enums.UserRole;
import com.parkingfinder.backend.enums.WalletStatus;
import com.parkingfinder.backend.exception.BadRequestException;
import com.parkingfinder.backend.exception.UnauthorizedException;
import com.parkingfinder.backend.mapper.UserMapper;
import com.parkingfinder.backend.mapper.WalletMapper;
import com.parkingfinder.backend.repository.AppUserRepository;
import com.parkingfinder.backend.repository.OtpResetTokenRepository;
import com.parkingfinder.backend.repository.WalletAccountRepository;
import com.parkingfinder.backend.security.JwtService;
import com.parkingfinder.backend.security.UserPrincipal;
import com.parkingfinder.backend.service.AuthService;
import com.parkingfinder.backend.service.EmailService;
import com.parkingfinder.backend.util.IdGenerator;
import com.parkingfinder.backend.util.SecurityUtils;
import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AppUserRepository appUserRepository;
    private final WalletAccountRepository walletAccountRepository;
    private final OtpResetTokenRepository otpResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserMapper userMapper;
    private final WalletMapper walletMapper;
    private final EmailService emailService;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Value("${app.otp.expiration-minutes:5}")
    private int otpExpirationMinutes;

    // ── Registration ──────────────────────────────────────────────────

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        if (appUserRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        UserRole role = UserRole.fromValue(request.getRole());

        AppUser user = AppUser.builder()
            .userId(IdGenerator.generate("usr"))
            .fullName(request.getFullName())
            .email(request.getEmail().toLowerCase())
            .phone(request.getPhone())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .role(role)
            .accountStatus(AccountStatus.ACTIVE)
            .createdAt(LocalDateTime.now())
            .build();

        user = appUserRepository.save(user);

        WalletResponse walletResponse = null;
        if (role == UserRole.DRIVER) {
            WalletAccount wallet = WalletAccount.builder()
                .walletId(IdGenerator.generate("wal"))
                .user(user)
                .creditBalance(BigDecimal.valueOf(500))
                .walletStatus(WalletStatus.ACTIVE)
                .updatedAt(LocalDateTime.now())
                .build();
            walletAccountRepository.save(wallet);
            walletResponse = walletMapper.toDto(wallet);
        }

        String token = jwtService.generateToken(new UserPrincipal(user));
        UserResponse userResponse = userMapper.toDto(user);

        return AuthResponse.builder()
            .token(token)
            .user(userResponse)
            .role(role.getValue())
            .redirectTo(role.getRedirectRoute())
            .wallet(walletResponse)
            .build();
    }

    // ── Login ─────────────────────────────────────────────────────────

    @Override
    public AuthResponse login(LoginRequest request) {
        AppUser user = appUserRepository.findByEmailIgnoreCase(request.getEmail())
            .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        if (user.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new UnauthorizedException("Account is inactive");
        }

        if (request.getRole() != null && !request.getRole().isBlank()) {
            UserRole requestedRole = UserRole.fromValue(request.getRole());
            if (user.getRole() != requestedRole) {
                throw new UnauthorizedException("Invalid credentials for selected role");
            }
        }

        WalletResponse walletResponse = walletAccountRepository.findByUserUserId(user.getUserId())
            .map(walletMapper::toDto)
            .orElse(null);

        String token = jwtService.generateToken(new UserPrincipal(user));
        return AuthResponse.builder()
            .token(token)
            .user(userMapper.toDto(user))
            .role(user.getRole().getValue())
            .redirectTo(user.getRole().getRedirectRoute())
            .wallet(walletResponse)
            .build();
    }

    // ── Me ─────────────────────────────────────────────────────────────

    @Override
    public AuthResponse me() {
        String userId = SecurityUtils.getCurrentUserId();
        AppUser user = appUserRepository.findById(userId)
            .orElseThrow(() -> new UnauthorizedException("User not found"));

        WalletResponse walletResponse = walletAccountRepository.findByUserUserId(user.getUserId())
            .map(walletMapper::toDto)
            .orElse(null);

        return AuthResponse.builder()
            .token(null)
            .user(userMapper.toDto(user))
            .role(user.getRole().getValue())
            .redirectTo(user.getRole().getRedirectRoute())
            .wallet(walletResponse)
            .build();
    }

    // ── Forgot Password (Step 1: Send OTP) ────────────────────────────

    @Override
    @Transactional
    public ForgotPasswordResponse forgotPassword(String email) {
        // Always return success to prevent email enumeration attacks
        appUserRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
            // Invalidate any previous unused OTPs for this email
            otpResetTokenRepository.invalidateAllByEmail(user.getEmail());

            // Generate a 6-digit OTP
            String otp = generateOtp();

            // Persist the token
            OtpResetToken token = OtpResetToken.builder()
                .id(IdGenerator.generate("otp"))
                .email(user.getEmail())
                .otp(otp)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(otpExpirationMinutes))
                .used(false)
                .build();
            otpResetTokenRepository.save(token);

            // Send the OTP email (async — does not block the response)
            emailService.sendOtpEmail(user.getEmail(), otp);

            log.info("OTP generated for password reset: email={}", user.getEmail());
        });

        return ForgotPasswordResponse.builder()
            .success(true)
            .message("If this email is registered, an OTP has been sent to your inbox.")
            .build();
    }

    // ── Verify OTP (Step 2) ───────────────────────────────────────────

    @Override
    public ForgotPasswordResponse verifyOtp(VerifyOtpRequest request) {
        OtpResetToken token = otpResetTokenRepository
            .findTopByEmailIgnoreCaseAndUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
                request.getEmail(), LocalDateTime.now())
            .orElseThrow(() -> new BadRequestException("Invalid or expired OTP"));

        if (!token.getOtp().equals(request.getOtp())) {
            throw new BadRequestException("Invalid or expired OTP");
        }

        return ForgotPasswordResponse.builder()
            .success(true)
            .message("OTP verified successfully. You may now reset your password.")
            .build();
    }

    // ── Reset Password (Step 3) ───────────────────────────────────────

    @Override
    @Transactional
    public ForgotPasswordResponse resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        // Re-verify the OTP
        OtpResetToken token = otpResetTokenRepository
            .findTopByEmailIgnoreCaseAndUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
                request.getEmail(), LocalDateTime.now())
            .orElseThrow(() -> new BadRequestException("Invalid or expired OTP"));

        if (!token.getOtp().equals(request.getOtp())) {
            throw new BadRequestException("Invalid or expired OTP");
        }

        // Mark the token as used
        token.setUsed(true);
        otpResetTokenRepository.save(token);

        // Update the user's password
        AppUser user = appUserRepository.findByEmailIgnoreCase(request.getEmail())
            .orElseThrow(() -> new BadRequestException("User not found"));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        appUserRepository.save(user);

        log.info("Password reset successful for email={}", user.getEmail());

        return ForgotPasswordResponse.builder()
            .success(true)
            .message("Password has been reset successfully. You can now log in with your new password.")
            .build();
    }

    // ── Helpers ────────────────────────────────────────────────────────

    /** Generate a secure 6-digit OTP. */
    private String generateOtp() {
        int otp = 100_000 + SECURE_RANDOM.nextInt(900_000); // 100000–999999
        return String.valueOf(otp);
    }
}
