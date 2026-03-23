package com.parkingfinder.backend.service.impl;

import com.parkingfinder.backend.dto.admin.AdminDashboardSummaryResponse;
import com.parkingfinder.backend.dto.admin.AdminUserRowResponse;
import com.parkingfinder.backend.dto.admin.ApproveSpotRequest;
import com.parkingfinder.backend.dto.admin.MonthlyAmountResponse;
import com.parkingfinder.backend.dto.admin.PendingApprovalResponse;
import com.parkingfinder.backend.dto.admin.RejectSpotRequest;
import com.parkingfinder.backend.dto.admin.ReportsSummaryResponse;
import com.parkingfinder.backend.dto.parking.PricingRuleDto;
import com.parkingfinder.backend.dto.parking.PricingRuleRequest;
import com.parkingfinder.backend.dto.parking.SpotResponse;
import com.parkingfinder.backend.dto.user.UserResponse;
import com.parkingfinder.backend.entity.AppUser;
import com.parkingfinder.backend.entity.ParkingSpot;
import com.parkingfinder.backend.entity.PricingRule;
import com.parkingfinder.backend.entity.SpotApproval;
import com.parkingfinder.backend.enums.AccountStatus;
import com.parkingfinder.backend.enums.ApprovalStatus;
import com.parkingfinder.backend.enums.BookingStatus;
import com.parkingfinder.backend.enums.PaymentStatus;
import com.parkingfinder.backend.enums.PricingType;
import com.parkingfinder.backend.enums.RuleStatus;
import com.parkingfinder.backend.enums.SpotStatus;
import com.parkingfinder.backend.enums.UserRole;
import com.parkingfinder.backend.exception.BadRequestException;
import com.parkingfinder.backend.exception.ResourceNotFoundException;
import com.parkingfinder.backend.mapper.SpotMapper;
import com.parkingfinder.backend.mapper.UserMapper;
import com.parkingfinder.backend.mapper.WalletMapper;
import com.parkingfinder.backend.repository.AppUserRepository;
import com.parkingfinder.backend.repository.BookingRepository;
import com.parkingfinder.backend.repository.ParkingSpotRepository;
import com.parkingfinder.backend.repository.PaymentRepository;
import com.parkingfinder.backend.repository.PricingRuleRepository;
import com.parkingfinder.backend.repository.SpotApprovalRepository;
import com.parkingfinder.backend.repository.WalletAccountRepository;
import com.parkingfinder.backend.service.AdminService;
import com.parkingfinder.backend.util.IdGenerator;
import com.parkingfinder.backend.util.SecurityUtils;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminServiceImpl implements AdminService {

    private static final DateTimeFormatter MONTH_LABEL_FORMATTER = DateTimeFormatter.ofPattern("MMM yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final AppUserRepository appUserRepository;
    private final ParkingSpotRepository parkingSpotRepository;
    private final SpotApprovalRepository spotApprovalRepository;
    private final PricingRuleRepository pricingRuleRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final WalletAccountRepository walletAccountRepository;
    private final UserMapper userMapper;
    private final SpotMapper spotMapper;
    private final WalletMapper walletMapper;
    private final ParkingServiceImpl parkingService;

    @Override
    public AdminDashboardSummaryResponse getDashboardSummary() {
        long totalUsers = appUserRepository.count();
        long totalLenders = appUserRepository.findAll().stream().filter(user -> "lender".equals(user.getRole().getValue())).count();
        long totalSpots = parkingSpotRepository.count();
        long pendingApprovals = spotApprovalRepository.findByApprovalStatus(ApprovalStatus.PENDING).size();
        long activeBookings = bookingRepository.findAll().stream().filter(b -> b.getBookingStatus() == BookingStatus.ACTIVE).count();
        BigDecimal totalPayments = paymentRepository.findAll().stream()
            .map(payment -> payment.getAmountPaid() != null ? payment.getAmountPaid() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return AdminDashboardSummaryResponse.builder()
            .totalUsers(totalUsers)
            .totalLenders(totalLenders)
            .totalSpots(totalSpots)
            .pendingApprovals(pendingApprovals)
            .activeBookings(activeBookings)
            .totalPayments(totalPayments)
            .build();
    }

    @Override
    public List<PendingApprovalResponse> getPendingApprovals() {
        return spotApprovalRepository.findByApprovalStatus(ApprovalStatus.PENDING)
            .stream()
            .map(this::toPendingApproval)
            .toList();
    }

    @Override
    public SpotResponse getApprovalBySpotId(String spotId) {
        return parkingService.getSpotById(spotId);
    }

    @Override
    @Transactional
    public void approveSpot(String spotId, ApproveSpotRequest request) {
        String adminId = SecurityUtils.getCurrentUserId();
        AppUser admin = appUserRepository.findById(adminId)
            .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        ParkingSpot spot = parkingSpotRepository.findById(spotId)
            .orElseThrow(() -> new ResourceNotFoundException("Spot not found"));

        SpotApproval approval = spotApprovalRepository.findBySpotSpotId(spotId)
            .orElseThrow(() -> new ResourceNotFoundException("Approval record not found"));

        PricingRule rule = pricingRuleRepository.findTopBySpotSpotIdOrderByCreatedAtDesc(spotId)
            .orElseGet(() -> PricingRule.builder()
                .pricingRuleId(IdGenerator.generate("pr"))
                .spot(spot)
                .pricingType(PricingType.HOURLY)
                .createdBy(adminId)
                .createdAt(LocalDateTime.now())
                .build());

        BigDecimal baseRate = request.getBaseHourlyRate() != null
            ? request.getBaseHourlyRate()
            : rule.getSuggestedBaseHourlyRate();

        if (baseRate == null || baseRate.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Please set a valid base hourly rate before approval");
        }

        rule.setBaseHourlyRate(baseRate);
        rule.setPeakHourRate(request.getPeakHourRate() != null ? request.getPeakHourRate() : baseRate);
        rule.setSpecialDayRate(request.getSpecialDayRate() != null ? request.getSpecialDayRate() : baseRate);
        rule.setEffectiveFrom(request.getEffectiveFrom() != null ? request.getEffectiveFrom() : LocalDate.now());
        rule.setEffectiveTo(request.getEffectiveTo() != null ? request.getEffectiveTo() : LocalDate.now().plusYears(1));
        rule.setRuleStatus(RuleStatus.ACTIVE);
        rule.setCreatedBy(adminId);
        if (rule.getCreatedAt() == null) {
            rule.setCreatedAt(LocalDateTime.now());
        }
        pricingRuleRepository.save(rule);

        approval.setApprovalStatus(ApprovalStatus.APPROVED);
        approval.setAdmin(admin);
        approval.setRejectionReason(null);
        approval.setReviewedAt(LocalDateTime.now());
        spotApprovalRepository.save(approval);

        spot.setSpotStatus(SpotStatus.ACTIVE);
        parkingSpotRepository.save(spot);
        parkingService.syncSpotDeviceAutomation(spotId);
    }

    @Override
    @Transactional
    public void rejectSpot(String spotId, RejectSpotRequest request) {
        String adminId = SecurityUtils.getCurrentUserId();
        AppUser admin = appUserRepository.findById(adminId)
            .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        ParkingSpot spot = parkingSpotRepository.findById(spotId)
            .orElseThrow(() -> new ResourceNotFoundException("Spot not found"));

        SpotApproval approval = spotApprovalRepository.findBySpotSpotId(spotId)
            .orElseThrow(() -> new ResourceNotFoundException("Approval record not found"));

        approval.setApprovalStatus(ApprovalStatus.REJECTED);
        approval.setAdmin(admin);
        approval.setRejectionReason(request.getReason());
        approval.setReviewedAt(LocalDateTime.now());
        spotApprovalRepository.save(approval);

        spot.setSpotStatus(SpotStatus.INACTIVE);
        parkingSpotRepository.save(spot);
        parkingService.syncSpotDeviceAutomation(spotId);

        pricingRuleRepository.findTopBySpotSpotIdOrderByCreatedAtDesc(spotId).ifPresent(rule -> {
            rule.setRuleStatus(RuleStatus.REJECTED);
            pricingRuleRepository.save(rule);
        });
    }

    @Override
    public List<SpotResponse> getAllSpots(String city, String status, String approvalStatus) {
        return parkingSpotRepository.findAll().stream()
            .map(parkingService::toFullSpot)
            .filter(spot -> city == null || city.isBlank() || spot.getCity().equalsIgnoreCase(city))
            .filter(spot -> status == null || status.isBlank() || spot.getSpotStatus().equalsIgnoreCase(status))
            .filter(spot -> approvalStatus == null || approvalStatus.isBlank() || spot.getApprovalStatus().equalsIgnoreCase(approvalStatus))
            .toList();
    }

    @Override
    @Transactional
    public SpotResponse updateSpotStatus(String spotId, String spotStatus) {
        ParkingSpot spot = parkingSpotRepository.findById(spotId)
            .orElseThrow(() -> new ResourceNotFoundException("Spot not found"));

        spot.setSpotStatus(SpotStatus.fromValue(spotStatus));
        parkingSpotRepository.save(spot);
        parkingService.syncSpotDeviceAutomation(spotId);
        return parkingService.toFullSpot(spot);
    }

    @Override
    @Transactional
    public SpotResponse updateSpotDevice(String spotId, boolean deviceOpen) {
        ParkingSpot spot = parkingSpotRepository.findById(spotId)
            .orElseThrow(() -> new ResourceNotFoundException("Spot not found"));

        spot.setDeviceOpen(deviceOpen);
        parkingSpotRepository.save(spot);
        return parkingService.toFullSpot(spot);
    }

    @Override
    public List<AdminUserRowResponse> getUsers(String role, String status) {
        return appUserRepository.findAll().stream()
            .filter(user -> role == null || role.isBlank() || user.getRole().getValue().equalsIgnoreCase(role))
            .filter(user -> status == null || status.isBlank() || user.getAccountStatus().getValue().equalsIgnoreCase(status))
            .map(this::toAdminUserRow)
            .toList();
    }

    @Override
    @Transactional
    public AdminUserRowResponse updateUserStatus(String userId, String accountStatus) {
        AppUser user = appUserRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!isStatusManageAllowedRole(user.getRole())) {
            throw new BadRequestException("Only driver, lender, and admin account status can be changed here");
        }

        AccountStatus nextStatus = AccountStatus.fromValue(accountStatus);
        String currentAdminId = SecurityUtils.getCurrentUserId();
        if (user.getRole() == UserRole.ADMIN
            && user.getUserId().equals(currentAdminId)
            && nextStatus != AccountStatus.ACTIVE) {
            throw new BadRequestException("You cannot deactivate your own admin account");
        }

        user.setAccountStatus(nextStatus);
        appUserRepository.save(user);
        return toAdminUserRow(user);
    }

    @Override
    public List<PricingRuleDto> getPricingRules() {
        return pricingRuleRepository.findAllByOrderByCreatedAtDesc()
            .stream()
            .map(spotMapper::toPricingDto)
            .toList();
    }

    @Override
    @Transactional
    public PricingRuleDto createPricingRule(PricingRuleRequest request) {
        String adminId = SecurityUtils.getCurrentUserId();
        ParkingSpot spot = parkingSpotRepository.findById(request.getSpotId())
            .orElseThrow(() -> new ResourceNotFoundException("Spot not found"));

        if (request.getEffectiveFrom().isAfter(request.getEffectiveTo())) {
            throw new BadRequestException("Effective from date must be before effective to date");
        }

        LocalTime peakStartTime = parseOptionalTime(request.getPeakStartTime());
        LocalTime peakEndTime = parseOptionalTime(request.getPeakEndTime());
        if ((peakStartTime == null) != (peakEndTime == null)) {
            throw new BadRequestException("Both peak start and peak end time are required");
        }
        if (peakStartTime != null && !peakEndTime.isAfter(peakStartTime)) {
            throw new BadRequestException("Peak end time must be after peak start time");
        }

        BigDecimal specialDayRate = request.getSpecialDayRate();
        LocalDate specialDayDate = request.getSpecialDayDate();
        if (isPositive(specialDayRate) && specialDayDate == null) {
            throw new BadRequestException("Special day date is required when special day rate is set");
        }
        if (!isPositive(specialDayRate) && specialDayDate != null) {
            throw new BadRequestException("Special day rate is required when special day date is set");
        }

        PricingRule rule = PricingRule.builder()
            .pricingRuleId(IdGenerator.generate("pr"))
            .spot(spot)
            .pricingType(PricingType.fromValue(request.getPricingType()))
            .baseHourlyRate(request.getBaseHourlyRate())
            .peakHourRate(request.getPeakHourRate())
            .peakStartTime(peakStartTime)
            .peakEndTime(peakEndTime)
            .specialDayRate(specialDayRate)
            .specialDayDate(specialDayDate)
            .suggestedBaseHourlyRate(request.getBaseHourlyRate())
            .suggestedPeakHourRate(request.getPeakHourRate())
            .suggestedSpecialDayRate(specialDayRate)
            .effectiveFrom(request.getEffectiveFrom())
            .effectiveTo(request.getEffectiveTo())
            .ruleStatus(RuleStatus.ACTIVE)
            .createdBy(adminId)
            .createdAt(LocalDateTime.now())
            .build();

        pricingRuleRepository.save(rule);
        return spotMapper.toPricingDto(rule);
    }

    @Override
    @Transactional
    public PricingRuleDto togglePricingRule(String ruleId) {
        PricingRule rule = pricingRuleRepository.findById(ruleId)
            .orElseThrow(() -> new ResourceNotFoundException("Pricing rule not found"));

        rule.setRuleStatus(rule.getRuleStatus() == RuleStatus.ACTIVE ? RuleStatus.INACTIVE : RuleStatus.ACTIVE);
        pricingRuleRepository.save(rule);
        return spotMapper.toPricingDto(rule);
    }

    @Override
    public ReportsSummaryResponse getReportsSummary() {
        Map<String, Long> byRole = appUserRepository.countUsersGroupedByRole().stream()
            .collect(Collectors.toMap(
                row -> ((UserRole) row[0]).getValue(),
                row -> ((Number) row[1]).longValue(),
                (left, right) -> right,
                LinkedHashMap::new
            ));

        Map<String, Long> byBookingStatus = bookingRepository.countBookingsGroupedByStatus().stream()
            .collect(Collectors.toMap(
                row -> ((BookingStatus) row[0]).getValue(),
                row -> ((Number) row[1]).longValue(),
                (left, right) -> right,
                LinkedHashMap::new
            ));

        Map<String, Long> byApproval = spotApprovalRepository.countApprovalsGroupedByStatus().stream()
            .collect(Collectors.toMap(
                row -> ((ApprovalStatus) row[0]).getValue(),
                row -> ((Number) row[1]).longValue(),
                (left, right) -> right,
                LinkedHashMap::new
            ));

        return ReportsSummaryResponse.builder()
            .byRole(byRole)
            .byBookingStatus(byBookingStatus)
            .byApproval(byApproval)
            .monthlyRevenue(buildMonthlyRevenue(6))
            .build();
    }

    private List<MonthlyAmountResponse> buildMonthlyRevenue(int monthsBack) {
        YearMonth currentMonth = YearMonth.now();
        YearMonth startMonth = currentMonth.minusMonths(monthsBack - 1L);

        Map<YearMonth, BigDecimal> monthlyTotals = new LinkedHashMap<>();
        for (int i = 0; i < monthsBack; i++) {
            monthlyTotals.put(startMonth.plusMonths(i), BigDecimal.ZERO);
        }

        paymentRepository.summarizePaidAmountsByMonth(PaymentStatus.PAID)
            .forEach(row -> {
                int year = ((Number) row[0]).intValue();
                int monthValue = ((Number) row[1]).intValue();
                BigDecimal amount = row[2] instanceof BigDecimal
                    ? (BigDecimal) row[2]
                    : BigDecimal.valueOf(((Number) row[2]).doubleValue());
                YearMonth month = YearMonth.of(year, monthValue);
                if (monthlyTotals.containsKey(month)) {
                    monthlyTotals.put(month, amount);
                }
            });

        return monthlyTotals.entrySet().stream()
            .map(entry -> new MonthlyAmountResponse(
                entry.getKey().format(MONTH_LABEL_FORMATTER),
                entry.getValue()
            ))
            .toList();
    }

    private PendingApprovalResponse toPendingApproval(SpotApproval approval) {
        SpotResponse spot = parkingService.toFullSpot(approval.getSpot());
        UserResponse lender = userMapper.toDto(approval.getSpot().getLender());
        PricingRuleDto pricing = pricingRuleRepository.findTopBySpotSpotIdOrderByCreatedAtDesc(approval.getSpot().getSpotId())
            .map(spotMapper::toPricingDto)
            .orElse(null);

        return PendingApprovalResponse.builder()
            .approvalId(approval.getApprovalId())
            .spot(spot)
            .lender(lender)
            .pricing(pricing)
            .approvalStatus(approval.getApprovalStatus().getValue())
            .rejectionReason(approval.getRejectionReason())
            .submittedAt(approval.getSubmittedAt() != null ? approval.getSubmittedAt().toString() : null)
            .reviewedAt(approval.getReviewedAt() != null ? approval.getReviewedAt().toString() : null)
            .approval(spotMapper.toApprovalDto(approval))
            .build();
    }

    private LocalTime parseOptionalTime(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return LocalTime.parse(value, TIME_FORMATTER);
        } catch (Exception ex) {
            throw new BadRequestException("Invalid time value. Use HH:mm format");
        }
    }

    private boolean isPositive(BigDecimal value) {
        return value != null && value.compareTo(BigDecimal.ZERO) > 0;
    }

    private boolean isStatusManageAllowedRole(UserRole role) {
        return role == UserRole.DRIVER || role == UserRole.LENDER || role == UserRole.ADMIN;
    }

    private AdminUserRowResponse toAdminUserRow(AppUser user) {
        return AdminUserRowResponse.builder()
            .userId(user.getUserId())
            .fullName(user.getFullName())
            .email(user.getEmail())
            .phone(user.getPhone())
            .role(user.getRole().getValue())
            .accountStatus(user.getAccountStatus().getValue())
            .spots(parkingSpotRepository.findByLenderUserIdOrderByCreatedAtDesc(user.getUserId()).size())
            .bookings(bookingRepository.findByUserUserIdOrderByCreatedAtDesc(user.getUserId()).size())
            .wallet(walletAccountRepository.findByUserUserId(user.getUserId()).map(walletMapper::toDto).orElse(null))
            .build();
    }
}
