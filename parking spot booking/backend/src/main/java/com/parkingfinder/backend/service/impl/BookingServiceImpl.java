package com.parkingfinder.backend.service.impl;

import com.parkingfinder.backend.dto.booking.BookingHistoryResponse;
import com.parkingfinder.backend.dto.booking.BookingResponse;
import com.parkingfinder.backend.dto.booking.CheckoutRequest;
import com.parkingfinder.backend.dto.booking.ConfirmBookingRequest;
import com.parkingfinder.backend.dto.booking.CreateReservationHoldRequest;
import com.parkingfinder.backend.dto.booking.ReservationHoldResponse;

import com.parkingfinder.backend.entity.AppUser;
import com.parkingfinder.backend.entity.Booking;
import com.parkingfinder.backend.entity.BookingHistory;
import com.parkingfinder.backend.entity.ParkingSpot;
import com.parkingfinder.backend.entity.Payment;
import com.parkingfinder.backend.entity.PricingRule;
import com.parkingfinder.backend.entity.ReservationHold;
import com.parkingfinder.backend.entity.Vehicle;
import com.parkingfinder.backend.entity.WalletAccount;
import com.parkingfinder.backend.entity.WalletTransaction;
import com.parkingfinder.backend.enums.BookingStatus;
import com.parkingfinder.backend.enums.HoldStatus;
import com.parkingfinder.backend.enums.PaymentMethod;
import com.parkingfinder.backend.enums.PaymentStatus;
import com.parkingfinder.backend.enums.ReferenceType;
import com.parkingfinder.backend.enums.SlotStatus;
import com.parkingfinder.backend.enums.SpotStatus;
import com.parkingfinder.backend.enums.TransactionStatus;
import com.parkingfinder.backend.enums.TransactionType;
import com.parkingfinder.backend.exception.BadRequestException;
import com.parkingfinder.backend.exception.BookingOverlapException;
import com.parkingfinder.backend.exception.InsufficientWalletBalanceException;
import com.parkingfinder.backend.exception.ResourceNotFoundException;
import com.parkingfinder.backend.mapper.BookingMapper;
import com.parkingfinder.backend.mapper.BookingResponseBuilder;
import com.parkingfinder.backend.repository.AppUserRepository;
import com.parkingfinder.backend.repository.BookingHistoryRepository;
import com.parkingfinder.backend.repository.BookingRepository;
import com.parkingfinder.backend.repository.ParkingSpotRepository;
import com.parkingfinder.backend.repository.PaymentRepository;
import com.parkingfinder.backend.repository.PricingRuleRepository;
import com.parkingfinder.backend.repository.ReservationHoldRepository;
import com.parkingfinder.backend.repository.VehicleRepository;
import com.parkingfinder.backend.repository.WalletAccountRepository;
import com.parkingfinder.backend.repository.WalletTransactionRepository;
import com.parkingfinder.backend.service.BookingService;
import com.parkingfinder.backend.service.WalletService;
import com.parkingfinder.backend.util.IdGenerator;
import com.parkingfinder.backend.util.BookingProtectionUtil;
import com.parkingfinder.backend.util.PricingUtil;
import com.parkingfinder.backend.util.SecurityUtils;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookingServiceImpl implements BookingService {

    private static final List<BookingStatus> PROTECTED_BOOKING_STATUSES = List.of(
        BookingStatus.ACTIVE,
        BookingStatus.UPCOMING,
        BookingStatus.COMPLETED,
        BookingStatus.OVERSTAY
    );

    private final BookingRepository bookingRepository;
    private final BookingHistoryRepository bookingHistoryRepository;
    private final ReservationHoldRepository reservationHoldRepository;
    private final ParkingSpotRepository parkingSpotRepository;
    private final VehicleRepository vehicleRepository;
    private final PricingRuleRepository pricingRuleRepository;
    private final PaymentRepository paymentRepository;
    private final WalletAccountRepository walletAccountRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final AppUserRepository appUserRepository;
    private final BookingMapper bookingMapper;
    private final BookingResponseBuilder bookingResponseBuilder;
    private final ParkingServiceImpl parkingService;
    private final WalletService walletService;

    @Override
    @Transactional
    public ReservationHoldResponse createReservationHold(CreateReservationHoldRequest request) {
        String userId = SecurityUtils.getCurrentUserId();
        if (request.getUserId() != null && !request.getUserId().isBlank() && !request.getUserId().equals(userId)) {
            throw new BadRequestException("User mismatch in request");
        }

        AppUser user = appUserRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ParkingSpot spot = parkingSpotRepository.findById(request.getSpotId())
            .orElseThrow(() -> new ResourceNotFoundException("Spot not found"));
        validateSlotRequest(spot, request.getSlotId());

        if (spot.getSpotStatus() != SpotStatus.ACTIVE) {
            throw new BadRequestException("Spot is not accepting bookings right now");
        }
        if (spot.getSlotStatus() == SlotStatus.BLOCKED) {
            throw new BadRequestException("Slot is blocked");
        }

        ReservationHold hold = ReservationHold.builder()
            .holdId(IdGenerator.generate("hold"))
            .spot(spot)
            .slotId(resolveSlotId(spot))
            .user(user)
            .holdStartTime(LocalDateTime.now())
            .holdExpiryTime(LocalDateTime.now().plusMinutes(10))
            .holdStatus(HoldStatus.ACTIVE)
            .reservedAmount(BigDecimal.ZERO)
            .build();
        reservationHoldRepository.save(hold);

        return ReservationHoldResponse.builder()
            .holdId(hold.getHoldId())
            .userId(user.getUserId())
            .slotId(hold.getSlotId())
            .holdStartTime(hold.getHoldStartTime())
            .holdExpiryTime(hold.getHoldExpiryTime())
            .holdStatus(hold.getHoldStatus().getValue())
            .reservedAmount(hold.getReservedAmount())
            .build();
    }

    @Override
    @Transactional
    public BookingResponse confirmBooking(ConfirmBookingRequest request) {

        // ── 1. Validate user identity ──────────────────────────────────────
        String userId = SecurityUtils.getCurrentUserId();
        if (request.getUserId() != null && !request.getUserId().isBlank() && !request.getUserId().equals(userId)) {
            throw new BadRequestException("User mismatch in request");
        }

        // ── 2. Load and validate spot & vehicle ───────────────────────────
        AppUser user = appUserRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ParkingSpot spot = parkingSpotRepository.findById(request.getSpotId())
            .orElseThrow(() -> new ResourceNotFoundException("Spot not found"));
        validateSlotRequest(spot, request.getSlotId());
        String slotId = resolveSlotId(spot);

        if (spot.getSpotStatus() != SpotStatus.ACTIVE) {
            throw new BadRequestException("Spot is not accepting bookings right now");
        }
        if (spot.getSlotStatus() == SlotStatus.BLOCKED) {
            throw new BadRequestException("Selected slot is blocked");
        }

        Vehicle vehicle = vehicleRepository.findByVehicleIdAndUserUserId(request.getVehicleId(), userId)
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));

        // ── 3. Validate time window & check overlaps ──────────────────────
        LocalDateTime start = request.getBookedStartTime();
        LocalDateTime end = request.getBookedEndTime();
        if (start == null || end == null || !end.isAfter(start)) {
            throw new BadRequestException("Invalid booking time window");
        }

        List<Booking> overlaps = bookingRepository.findOverlappingBookings(
            slotId,
            PROTECTED_BOOKING_STATUSES,
            start,
            end
        );
        if (!overlaps.isEmpty()) {
            throw new BookingOverlapException("Slot already booked for selected time range or safety buffer");
        }

        // ── 4. Resolve pricing ─────────────────────────────────────────────
        PricingRule pricingRule = pricingRuleRepository.findTopBySpotSpotIdOrderByCreatedAtDesc(request.getSpotId())
            .orElseThrow(() -> new BadRequestException("No pricing rule configured for this spot"));

        BigDecimal hourlyRate = PricingUtil.resolveHourlyRate(start, pricingRule);
        if (hourlyRate == null || hourlyRate.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Spot is not yet priced by admin");
        }

        BigDecimal bookedAmount = PricingUtil.calculateBookingAmount(start, end, hourlyRate);

        // ── 5. Debit wallet ────────────────────────────────────────────────
        WalletAccount wallet = walletAccountRepository.findByUserUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Wallet account not found"));

        if (wallet.getCreditBalance().compareTo(bookedAmount) < 0) {
            throw new InsufficientWalletBalanceException("Insufficient wallet balance. Please add credits.");
        }

        wallet.setCreditBalance(wallet.getCreditBalance().subtract(bookedAmount));
        wallet.setUpdatedAt(LocalDateTime.now());
        walletAccountRepository.save(wallet);

        // ── 6. Create booking entity ───────────────────────────────────────
        BookingStatus bookingStatus = start.isAfter(LocalDateTime.now()) ? BookingStatus.UPCOMING : BookingStatus.ACTIVE;

        Booking booking = Booking.builder()
            .bookingId(IdGenerator.generate("bk"))
            .user(user)
            .spot(spot)
            .slotId(slotId)
            .vehicle(vehicle)
            .pricingRule(pricingRule)
            .bookingCode("PSF-" + ((int) (Math.random() * 90000) + 10000))
            .bookingDate(LocalDate.now())
            .bookedStartTime(start)
            .bookedEndTime(end)
            .bufferMinutes(BookingProtectionUtil.DEFAULT_BUFFER_MINUTES)
            .bufferEndTime(BookingProtectionUtil.resolveBufferEndTime(
                end,
                BookingProtectionUtil.DEFAULT_BUFFER_MINUTES
            ))
            .bookedAmount(bookedAmount)
            .lateFee(BigDecimal.ZERO)
            .totalAmount(bookedAmount)
            .bookingStatus(bookingStatus)
            .locationTag(spot.getLocality())
            .createdAt(LocalDateTime.now())
            .build();
        bookingRepository.save(booking);

        updateSpotAccessState(
            spot,
            bookingStatus == BookingStatus.ACTIVE ? SlotStatus.OCCUPIED : SlotStatus.AVAILABLE,
            true
        );

        // ── 7. Record wallet transaction & payment ─────────────────────────
        WalletTransaction walletTxn = WalletTransaction.builder()
            .walletTxnId(IdGenerator.generate("wtxn"))
            .wallet(wallet)
            .transactionType(TransactionType.DEBIT)
            .amount(bookedAmount)
            .referenceType(ReferenceType.BOOKING)
            .referenceId(booking.getBookingId())
            .transactionStatus(TransactionStatus.SUCCESS)
            .description("Payment for booking " + booking.getBookingCode())
            .createdAt(LocalDateTime.now())
            .build();
        walletTransactionRepository.save(walletTxn);

        Payment payment = Payment.builder()
            .paymentId(IdGenerator.generate("pay"))
            .booking(booking)
            .paymentMethod(PaymentMethod.WALLET)
            .amountPaid(bookedAmount)
            .paymentStatus(bookingStatus == BookingStatus.UPCOMING ? PaymentStatus.RESERVED : PaymentStatus.PAID)
            .transactionRef("TXN-" + booking.getBookingCode())
            .paidAt(LocalDateTime.now())
            .build();
        paymentRepository.save(payment);

        // ── 8. Booking history & clean up holds ───────────────────────────
        bookingHistoryRepository.save(BookingHistory.builder()
            .historyId(IdGenerator.generate("bh"))
            .booking(booking)
            .oldStatus(null)
            .newStatus(booking.getBookingStatus())
            .changedBy(userId)
            .remarks("Booking created and payment processed via wallet")
            .changedAt(LocalDateTime.now())
            .build());

        List<ReservationHold> activeHolds = reservationHoldRepository.findBySlotIdAndHoldStatusAndHoldExpiryTimeAfter(
            slotId,
            HoldStatus.ACTIVE,
            LocalDateTime.now()
        );
        activeHolds.stream()
            .filter(hold -> hold.getUser().getUserId().equals(userId))
            .forEach(hold -> hold.setHoldStatus(HoldStatus.CONSUMED));
        reservationHoldRepository.saveAll(activeHolds);

        return bookingResponseBuilder.build(booking);
    }

    @Override
    @Transactional
    public List<BookingResponse> getMyBookings() {
        String userId = SecurityUtils.getCurrentUserId();
        LocalDateTime now = LocalDateTime.now();
        return bookingRepository.findByUserUserIdOrderByCreatedAtDesc(userId)
            .stream()
            .map(booking -> syncUpcomingToActiveIfStarted(booking, now))
            .map(bookingResponseBuilder::build)
            .toList();
    }

    @Override
    @Transactional
    public BookingResponse getBookingById(String bookingId) {
        String userId = SecurityUtils.getCurrentUserId();
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getUser().getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Booking not found");
        }

        booking = syncUpcomingToActiveIfStarted(booking, LocalDateTime.now());
        return bookingResponseBuilder.build(booking);
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(String bookingId) {
        String userId = SecurityUtils.getCurrentUserId();
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (!booking.getUser().getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Booking not found");
        }

        if (booking.getBookingStatus() == BookingStatus.COMPLETED
            || booking.getBookingStatus() == BookingStatus.CANCELLED
            || booking.getBookingStatus() == BookingStatus.OVERSTAY) {
            throw new BadRequestException("Booking cannot be cancelled");
        }

        BookingStatus oldStatus = booking.getBookingStatus();
        booking.setBookingStatus(BookingStatus.CANCELLED);
        booking.setActualCheckoutTime(LocalDateTime.now());
        booking.setLateFee(BigDecimal.ZERO);
        booking.setTotalAmount(booking.getBookedAmount());
        bookingRepository.save(booking);

        updateSpotAccessState(booking.getSpot(), SlotStatus.AVAILABLE, false);

        WalletAccount wallet = walletAccountRepository.findByUserUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));
        wallet.setCreditBalance(wallet.getCreditBalance().add(booking.getBookedAmount()));
        wallet.setUpdatedAt(LocalDateTime.now());
        walletAccountRepository.save(wallet);

        WalletTransaction refundTxn = WalletTransaction.builder()
            .walletTxnId(IdGenerator.generate("wtxn"))
            .wallet(wallet)
            .transactionType(TransactionType.CREDIT)
            .amount(booking.getBookedAmount())
            .referenceType(ReferenceType.REFUND)
            .referenceId(booking.getBookingId())
            .transactionStatus(TransactionStatus.SUCCESS)
            .description("Refund for cancelled booking " + booking.getBookingCode())
            .createdAt(LocalDateTime.now())
            .build();
        walletTransactionRepository.save(refundTxn);

        paymentRepository.findByBookingBookingId(booking.getBookingId()).ifPresent(payment -> {
            payment.setPaymentStatus(PaymentStatus.REFUNDED);
            paymentRepository.save(payment);
        });

        bookingHistoryRepository.save(BookingHistory.builder()
            .historyId(IdGenerator.generate("bh"))
            .booking(booking)
            .oldStatus(oldStatus)
            .newStatus(BookingStatus.CANCELLED)
            .changedBy(userId)
            .remarks("Booking cancelled by user. Wallet refunded")
            .changedAt(LocalDateTime.now())
            .build());

        return bookingResponseBuilder.build(booking);
    }

    @Override
    @Transactional
    public BookingResponse checkoutBooking(String bookingId, CheckoutRequest request) {
        String userId = SecurityUtils.getCurrentUserId();
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (!booking.getUser().getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Booking not found");
        }

        if (booking.getBookingStatus() == BookingStatus.COMPLETED
            || booking.getBookingStatus() == BookingStatus.CANCELLED
            || booking.getBookingStatus() == BookingStatus.OVERSTAY) {
            throw new BadRequestException("Booking already closed");
        }

        LocalDateTime checkoutTime = request != null && request.getActualCheckoutTime() != null
            ? request.getActualCheckoutTime()
            : LocalDateTime.now();

        LocalDateTime protectedUntil = BookingProtectionUtil.resolveBlockedUntil(
            booking.getBookedEndTime(),
            booking.getBufferMinutes(),
            checkoutTime
        );
        boolean exceededBuffer = booking.getBufferEndTime() != null && checkoutTime.isAfter(booking.getBufferEndTime());

        BigDecimal lateFee = PricingUtil.calculateLateFee(
            booking.getBookedEndTime(),
            checkoutTime,
            resolveLateFeeRate(booking, checkoutTime)
        );

        if (lateFee.compareTo(BigDecimal.ZERO) > 0) {
            WalletAccount wallet = walletAccountRepository.findByUserUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));
            if (wallet.getCreditBalance().compareTo(lateFee) < 0) {
                throw new InsufficientWalletBalanceException("Insufficient wallet balance for late fee");
            }

            wallet.setCreditBalance(wallet.getCreditBalance().subtract(lateFee));
            wallet.setUpdatedAt(LocalDateTime.now());
            walletAccountRepository.save(wallet);

            WalletTransaction lateFeeTxn = WalletTransaction.builder()
                .walletTxnId(IdGenerator.generate("wtxn"))
                .wallet(wallet)
                .transactionType(TransactionType.DEBIT)
                .amount(lateFee)
                .referenceType(ReferenceType.LATE_FEE)
                .referenceId(booking.getBookingId())
                .transactionStatus(TransactionStatus.SUCCESS)
                .description("Late fee for booking " + booking.getBookingCode())
                .createdAt(LocalDateTime.now())
                .build();
            walletTransactionRepository.save(lateFeeTxn);

            paymentRepository.findByBookingBookingId(booking.getBookingId()).ifPresent(payment -> {
                payment.setAmountPaid(payment.getAmountPaid().add(lateFee));
                payment.setPaymentStatus(PaymentStatus.PAID);
                payment.setPaidAt(LocalDateTime.now());
                paymentRepository.save(payment);
            });
        }

        BookingStatus oldStatus = booking.getBookingStatus();
        booking.setActualCheckoutTime(checkoutTime);
        booking.setLateFee(lateFee);
        booking.setTotalAmount(booking.getBookedAmount().add(lateFee));
        booking.setBookingStatus(exceededBuffer ? BookingStatus.OVERSTAY : BookingStatus.COMPLETED);
        bookingRepository.save(booking);

        String lenderId = booking.getSpot().getLender().getUserId();
        walletService.credit(
            lenderId,
            booking.getTotalAmount(),
            "booking",
            booking.getBookingId(),
            "Earnings for booking " + booking.getBookingCode()
        );

        updateSpotAccessState(booking.getSpot(), SlotStatus.AVAILABLE, false);

        bookingHistoryRepository.save(BookingHistory.builder()
            .historyId(IdGenerator.generate("bh"))
            .booking(booking)
            .oldStatus(oldStatus)
            .newStatus(booking.getBookingStatus())
            .changedBy(userId)
            .remarks(buildCheckoutRemark(lateFee, exceededBuffer, protectedUntil))
            .changedAt(LocalDateTime.now())
            .build());

        return bookingResponseBuilder.build(booking);
    }

    @Override
    @Transactional
    public List<BookingHistoryResponse> getBookingHistory(String bookingId) {
        String userId = SecurityUtils.getCurrentUserId();
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (!booking.getUser().getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Booking not found");
        }

        syncUpcomingToActiveIfStarted(booking, LocalDateTime.now());
        return bookingHistoryRepository.findByBookingBookingIdOrderByChangedAtAsc(bookingId)
            .stream()
            .map(bookingMapper::toHistoryDto)
            .toList();
    }

    private Booking syncUpcomingToActiveIfStarted(Booking booking, LocalDateTime now) {
        if (booking.getBookingStatus() != BookingStatus.UPCOMING) {
            return booking;
        }

        if (booking.getBookedStartTime() == null || booking.getBookedStartTime().isAfter(now)) {
            return booking;
        }

        BookingStatus oldStatus = booking.getBookingStatus();
        booking.setBookingStatus(BookingStatus.ACTIVE);
        bookingRepository.save(booking);

        ParkingSpot spot = booking.getSpot();
        boolean spotChanged = false;
        if (spot.getSlotStatus() != SlotStatus.OCCUPIED) {
            spot.setSlotStatus(SlotStatus.OCCUPIED);
            spotChanged = true;
        }
        if (!spot.isDeviceOpen()) {
            spot.setDeviceOpen(true);
            spotChanged = true;
        }
        if (spotChanged) {
            parkingSpotRepository.save(spot);
        }

        bookingHistoryRepository.save(BookingHistory.builder()
            .historyId(IdGenerator.generate("bh"))
            .booking(booking)
            .oldStatus(oldStatus)
            .newStatus(BookingStatus.ACTIVE)
            .changedBy("system")
            .remarks("Booking auto-activated at start time")
            .changedAt(now)
            .build());

        return booking;
    }

    // toBookingResponse() logic has been extracted to BookingResponseBuilder (shared component)

    private void validateSlotRequest(ParkingSpot spot, String slotId) {
        if (!resolveSlotId(spot).equals(slotId)) {
            throw new ResourceNotFoundException("Slot not found");
        }
    }

    private String resolveSlotId(ParkingSpot spot) {
        return spot.getSlotId() != null && !spot.getSlotId().isBlank() ? spot.getSlotId() : spot.getSpotId();
    }

    private void updateSpotAccessState(ParkingSpot spot, SlotStatus slotStatus, boolean deviceOpen) {
        spot.setSlotStatus(slotStatus);
        spot.setDeviceOpen(deviceOpen);
        parkingSpotRepository.save(spot);
    }

    private BigDecimal resolveLateFeeRate(Booking booking, LocalDateTime checkoutTime) {
        BigDecimal currentRate = booking.getPricingRule() != null
            ? PricingUtil.resolveHourlyRate(checkoutTime, booking.getPricingRule())
            : BigDecimal.ZERO;
        if (currentRate.compareTo(BigDecimal.ZERO) > 0) {
            return currentRate;
        }

        if (booking.getBookedStartTime() != null
            && booking.getBookedEndTime() != null
            && booking.getBookedEndTime().isAfter(booking.getBookedStartTime())) {
            long bookedMinutes = Math.max(1, Duration.between(booking.getBookedStartTime(), booking.getBookedEndTime()).toMinutes());
            long bookedHours = Math.max(1, (long) Math.ceil(bookedMinutes / 60.0));
            return booking.getBookedAmount().divide(BigDecimal.valueOf(bookedHours), 2, RoundingMode.HALF_UP);
        }

        return booking.getBookedAmount();
    }

    private String buildCheckoutRemark(BigDecimal lateFee, boolean exceededBuffer, LocalDateTime protectedUntil) {
        if (exceededBuffer) {
            return "Booking exceeded the safety buffer. Admin attention needed until spot was free at " + protectedUntil;
        }
        if (lateFee.compareTo(BigDecimal.ZERO) > 0) {
            return "Booking checked out late within the reserved safety buffer";
        }
        return "Booking checked out on time with safety buffer protection";
    }
}
