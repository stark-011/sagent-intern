package com.parkingfinder.backend.seed;

import com.parkingfinder.backend.entity.AppUser;
import com.parkingfinder.backend.entity.Booking;
import com.parkingfinder.backend.entity.BookingHistory;
import com.parkingfinder.backend.entity.ParkingSpot;
import com.parkingfinder.backend.entity.Payment;
import com.parkingfinder.backend.entity.PricingRule;
import com.parkingfinder.backend.entity.ReservationHold;
import com.parkingfinder.backend.entity.Review;
import com.parkingfinder.backend.entity.SpotApproval;
import com.parkingfinder.backend.entity.SpotAvailability;
import com.parkingfinder.backend.entity.SpotImage;
import com.parkingfinder.backend.entity.Vehicle;
import com.parkingfinder.backend.entity.WalletAccount;
import com.parkingfinder.backend.entity.WalletTransaction;
import com.parkingfinder.backend.enums.AccountStatus;
import com.parkingfinder.backend.enums.ApprovalStatus;
import com.parkingfinder.backend.enums.BookingStatus;
import com.parkingfinder.backend.enums.HoldStatus;
import com.parkingfinder.backend.enums.PaymentMethod;
import com.parkingfinder.backend.enums.PaymentStatus;
import com.parkingfinder.backend.enums.PricingType;
import com.parkingfinder.backend.enums.ReferenceType;
import com.parkingfinder.backend.enums.RuleStatus;
import com.parkingfinder.backend.enums.SlotStatus;
import com.parkingfinder.backend.enums.SpotStatus;
import com.parkingfinder.backend.enums.SpotType;
import com.parkingfinder.backend.enums.TransactionStatus;
import com.parkingfinder.backend.enums.TransactionType;
import com.parkingfinder.backend.enums.UserRole;
import com.parkingfinder.backend.enums.VehicleType;
import com.parkingfinder.backend.enums.WalletStatus;
import com.parkingfinder.backend.repository.AppUserRepository;
import com.parkingfinder.backend.repository.BookingHistoryRepository;
import com.parkingfinder.backend.repository.BookingRepository;
import com.parkingfinder.backend.repository.ParkingSpotRepository;
import com.parkingfinder.backend.repository.PaymentRepository;
import com.parkingfinder.backend.repository.PricingRuleRepository;
import com.parkingfinder.backend.repository.ReservationHoldRepository;
import com.parkingfinder.backend.repository.ReviewRepository;
import com.parkingfinder.backend.repository.SpotApprovalRepository;
import com.parkingfinder.backend.repository.SpotAvailabilityRepository;
import com.parkingfinder.backend.repository.SpotImageRepository;
import com.parkingfinder.backend.repository.VehicleRepository;
import com.parkingfinder.backend.repository.WalletAccountRepository;
import com.parkingfinder.backend.repository.WalletTransactionRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(value = "app.seed.enabled", havingValue = "true")
public class DataSeeder implements CommandLineRunner {

    private final AppUserRepository appUserRepository;
    private final VehicleRepository vehicleRepository;
    private final WalletAccountRepository walletAccountRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final ParkingSpotRepository parkingSpotRepository;
    private final SpotImageRepository spotImageRepository;
    private final SpotAvailabilityRepository spotAvailabilityRepository;
    private final SpotApprovalRepository spotApprovalRepository;
    private final PricingRuleRepository pricingRuleRepository;
    private final ReservationHoldRepository reservationHoldRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final BookingHistoryRepository bookingHistoryRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (hasSeededMinimumData()) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        AppUser admin = appUserRepository.save(AppUser.builder()
            .userId("usr_admin_1")
            .fullName("Rohan Verma")
            .email("admin@example.com")
            .phone("+91-9800011111")
            .passwordHash(passwordEncoder.encode("Password@123"))
            .role(UserRole.ADMIN)
            .accountStatus(AccountStatus.ACTIVE)
            .createdAt(now.minusMonths(8))
            .build());

        AppUser lender = appUserRepository.save(AppUser.builder()
            .userId("usr_lender_1")
            .fullName("Neha Kapoor")
            .email("lender@example.com")
            .phone("+91-9811122233")
            .passwordHash(passwordEncoder.encode("Password@123"))
            .role(UserRole.LENDER)
            .accountStatus(AccountStatus.ACTIVE)
            .createdAt(now.minusMonths(5))
            .build());

        AppUser user = appUserRepository.save(AppUser.builder()
            .userId("usr_driver_1")
            .fullName("Aarav Mehta")
            .email("user@example.com")
            .phone("+91-9876543210")
            .passwordHash(passwordEncoder.encode("Password@123"))
            .role(UserRole.DRIVER)
            .accountStatus(AccountStatus.ACTIVE)
            .createdAt(now.minusMonths(4))
            .build());

        AppUser lender2 = appUserRepository.save(AppUser.builder()
            .userId("usr_lender_2")
            .fullName("Vikram Sethi")
            .email("lender2@example.com")
            .phone("+91-9811155566")
            .passwordHash(passwordEncoder.encode("Password@123"))
            .role(UserRole.LENDER)
            .accountStatus(AccountStatus.ACTIVE)
            .createdAt(now.minusMonths(3))
            .build());

        AppUser user2 = appUserRepository.save(AppUser.builder()
            .userId("usr_driver_2")
            .fullName("Ishita Rao")
            .email("user2@example.com")
            .phone("+91-9822212345")
            .passwordHash(passwordEncoder.encode("Password@123"))
            .role(UserRole.DRIVER)
            .accountStatus(AccountStatus.ACTIVE)
            .createdAt(now.minusMonths(2))
            .build());

        WalletAccount wallet = walletAccountRepository.save(WalletAccount.builder()
            .walletId("wal_1")
            .user(user)
            .creditBalance(BigDecimal.valueOf(3500))
            .walletStatus(WalletStatus.ACTIVE)
            .updatedAt(now.minusDays(1))
            .build());

        WalletAccount wallet2 = walletAccountRepository.save(WalletAccount.builder()
            .walletId("wal_2")
            .user(admin)
            .creditBalance(BigDecimal.valueOf(9000))
            .walletStatus(WalletStatus.ACTIVE)
            .updatedAt(now.minusDays(2))
            .build());

        WalletAccount wallet3 = walletAccountRepository.save(WalletAccount.builder()
            .walletId("wal_3")
            .user(lender)
            .creditBalance(BigDecimal.valueOf(1200))
            .walletStatus(WalletStatus.ACTIVE)
            .updatedAt(now.minusDays(3))
            .build());

        WalletAccount wallet4 = walletAccountRepository.save(WalletAccount.builder()
            .walletId("wal_4")
            .user(lender2)
            .creditBalance(BigDecimal.valueOf(800))
            .walletStatus(WalletStatus.ACTIVE)
            .updatedAt(now.minusDays(4))
            .build());

        WalletAccount wallet5 = walletAccountRepository.save(WalletAccount.builder()
            .walletId("wal_5")
            .user(user2)
            .creditBalance(BigDecimal.valueOf(2400))
            .walletStatus(WalletStatus.ACTIVE)
            .updatedAt(now.minusDays(1))
            .build());

        Vehicle veh1 = vehicleRepository.save(Vehicle.builder()
            .vehicleId("veh_1")
            .user(user)
            .vehicleName("Hyundai i20")
            .vehicleNumber("TN-01-AB-7788")
            .vehicleType(VehicleType.HATCHBACK)
            .color("White")
            .isDefault(true)
            .createdAt(now.minusMonths(3))
            .build());

        Vehicle veh2 = vehicleRepository.save(Vehicle.builder()
            .vehicleId("veh_2")
            .user(user)
            .vehicleName("Honda City")
            .vehicleNumber("TN-05-CD-9911")
            .vehicleType(VehicleType.SEDAN)
            .color("Black")
            .isDefault(false)
            .createdAt(now.minusMonths(2))
            .build());

        Vehicle veh3 = vehicleRepository.save(Vehicle.builder()
            .vehicleId("veh_3")
            .user(user)
            .vehicleName("Tata Safari")
            .vehicleNumber("TN-03-EV-2201")
            .vehicleType(VehicleType.MUV_SUV)
            .color("Blue")
            .isDefault(false)
            .createdAt(now.minusMonths(1))
            .build());

        Vehicle veh4 = vehicleRepository.save(Vehicle.builder()
            .vehicleId("veh_4")
            .user(user2)
            .vehicleName("Maruti Swift")
            .vehicleNumber("TN-09-GH-4421")
            .vehicleType(VehicleType.HATCHBACK)
            .color("Red")
            .isDefault(true)
            .createdAt(now.minusMonths(1))
            .build());

        Vehicle veh5 = vehicleRepository.save(Vehicle.builder()
            .vehicleId("veh_5")
            .user(user2)
            .vehicleName("Mahindra Thar")
            .vehicleNumber("TN-10-EV-5544")
            .vehicleType(VehicleType.JEEP)
            .color("Grey")
            .isDefault(false)
            .createdAt(now.minusDays(25))
            .build());

        ParkingSpot sp1 = createSpot("sp_1", lender, "T Nagar Secure Basement", "14 North Usman Rd", "T Nagar", "Chennai", SpotType.COVERED, SpotStatus.ACTIVE, 13.0418, 80.2337, Set.of(VehicleType.HATCHBACK, VehicleType.SEDAN), 1, now.minusMonths(2), 1.2, "slot_1", "B1-01", SlotStatus.AVAILABLE, true);
        ParkingSpot sp2 = createSpot("sp_2", lender, "OMR Open Lot", "88 Rajiv Gandhi Salai", "Perungudi", "Chennai", SpotType.OPEN, SpotStatus.ACTIVE, 12.9629, 80.2456, Set.of(VehicleType.HATCHBACK, VehicleType.SEDAN, VehicleType.MUV_SUV), 1, now.minusMonths(2), 4.1, "slot_3", "O-11", SlotStatus.AVAILABLE, true);
        ParkingSpot sp3 = createSpot("sp_3", lender, "Airport Shuttle Parking", "GST Road", "Meenambakkam", "Chennai", SpotType.OPEN, SpotStatus.ACTIVE, 12.9941, 80.1709, Set.of(VehicleType.SEDAN, VehicleType.MUV_SUV, VehicleType.VAN), 1, now.minusMonths(1), 12.4, "slot_4", "A-08", SlotStatus.OCCUPIED, true);
        ParkingSpot sp4 = createSpot("sp_4", lender, "Anna Nagar Tower", "3rd Avenue", "Anna Nagar", "Chennai", SpotType.MULTILEVEL, SpotStatus.INACTIVE, 13.0865, 80.2101, Set.of(VehicleType.SEDAN, VehicleType.CONVERTIBLE, VehicleType.MUV_SUV), 1, now.minusDays(20), 6.0, "slot_5", "T3-14", SlotStatus.AVAILABLE, true);
        ParkingSpot sp5 = createSpot("sp_5", lender, "Velachery Community Spot", "100 Feet Road", "Velachery", "Chennai", SpotType.RESIDENTIAL, SpotStatus.INACTIVE, 12.9809, 80.2206, Set.of(VehicleType.HATCHBACK, VehicleType.WAGON, VehicleType.SEDAN), 1, now.minusDays(15), 8.8, "slot_6", "R-04", SlotStatus.AVAILABLE, true);

        parkingSpotRepository.saveAll(List.of(sp1, sp2, sp3, sp4, sp5));

        createImage("img_1", sp1, "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1200&q=80", true, now.minusMonths(2));
        createImage("img_2", sp1, "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=1200&q=80", false, now.minusMonths(2));
        createImage("img_3", sp2, "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80", true, now.minusMonths(2));
        createImage("img_4", sp3, "https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?auto=format&fit=crop&w=1200&q=80", true, now.minusMonths(1));
        createImage("img_5", sp4, "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80", true, now.minusDays(20));
        createImage("img_6", sp5, "https://images.unsplash.com/photo-1621929747188-0b4dc28498d2?auto=format&fit=crop&w=1200&q=80", true, now.minusDays(15));

        createAvailability("avail_1", sp1, "mon-fri", "06:00", "23:30", true);
        createAvailability("avail_2", sp2, "all", "00:00", "23:59", true);
        createAvailability("avail_3", sp3, "all", "00:00", "23:59", true);
        createAvailability("avail_4", sp4, "mon-sat", "05:30", "22:30", true);
        createAvailability("avail_5", sp5, "mon-fri", "08:00", "20:00", false);

        createApproval("appr_1", sp1, admin, ApprovalStatus.APPROVED, null, now.minusMonths(2), now.minusMonths(2).plusDays(1));
        createApproval("appr_2", sp2, admin, ApprovalStatus.APPROVED, null, now.minusMonths(2), now.minusMonths(2).plusDays(1));
        createApproval("appr_3", sp3, admin, ApprovalStatus.APPROVED, null, now.minusMonths(1), now.minusMonths(1).plusDays(1));
        createApproval("appr_4", sp4, null, ApprovalStatus.PENDING, null, now.minusDays(20), null);
        createApproval("appr_5", sp5, admin, ApprovalStatus.REJECTED, "Incomplete CCTV coverage details in listing.", now.minusDays(15), now.minusDays(14));

        PricingRule pr1 = createPricing("pr_1", sp1, BigDecimal.valueOf(90), BigDecimal.valueOf(120), BigDecimal.valueOf(150), RuleStatus.ACTIVE, now.minusMonths(2));
        PricingRule pr2 = createPricing("pr_2", sp2, BigDecimal.valueOf(70), BigDecimal.valueOf(95), BigDecimal.valueOf(130), RuleStatus.ACTIVE, now.minusMonths(2));
        PricingRule pr3 = createPricing("pr_3", sp3, BigDecimal.valueOf(60), BigDecimal.valueOf(85), BigDecimal.valueOf(110), RuleStatus.ACTIVE, now.minusMonths(1));
        PricingRule pr4 = createPricing("pr_4", sp4, null, null, null, RuleStatus.PENDING_ADMIN_PRICING, now.minusDays(20));
        pr4.setSuggestedBaseHourlyRate(BigDecimal.valueOf(120));
        pr4.setSuggestedPeakHourRate(BigDecimal.valueOf(160));
        pr4.setSuggestedSpecialDayRate(BigDecimal.valueOf(220));
        pricingRuleRepository.save(pr4);
        PricingRule pr5 = createPricing("pr_5", sp5, BigDecimal.valueOf(50), BigDecimal.valueOf(75), BigDecimal.valueOf(90), RuleStatus.REJECTED, now.minusDays(15));

        Booking bk1 = bookingRepository.save(Booking.builder()
            .bookingId("bk_1")
            .user(user)
            .spot(sp1)
            .slotId(sp1.getSlotId())
            .vehicle(veh1)
            .pricingRule(pr1)
            .bookingCode("PSF-90871")
            .bookingDate(now.minusDays(9).toLocalDate())
            .bookedStartTime(now.minusDays(9).withHour(10).withMinute(0))
            .bookedEndTime(now.minusDays(9).withHour(13).withMinute(0))
            .actualCheckoutTime(now.minusDays(9).withHour(13).withMinute(22))
            .bookedAmount(BigDecimal.valueOf(270))
            .lateFee(BigDecimal.valueOf(50))
            .totalAmount(BigDecimal.valueOf(320))
            .bookingStatus(BookingStatus.COMPLETED)
            .locationTag("T Nagar")
            .createdAt(now.minusDays(10))
            .build());

        Booking bk2 = bookingRepository.save(Booking.builder()
            .bookingId("bk_2")
            .user(user)
            .spot(sp2)
            .slotId(sp2.getSlotId())
            .vehicle(veh2)
            .pricingRule(pr2)
            .bookingCode("PSF-90872")
            .bookingDate(now.minusDays(3).toLocalDate())
            .bookedStartTime(now.minusDays(3).withHour(9).withMinute(30))
            .bookedEndTime(now.minusDays(3).withHour(12).withMinute(0))
            .actualCheckoutTime(now.minusDays(3).withHour(11).withMinute(50))
            .bookedAmount(BigDecimal.valueOf(175))
            .lateFee(BigDecimal.ZERO)
            .totalAmount(BigDecimal.valueOf(175))
            .bookingStatus(BookingStatus.COMPLETED)
            .locationTag("Perungudi")
            .createdAt(now.minusDays(4))
            .build());

        Booking bk3 = bookingRepository.save(Booking.builder()
            .bookingId("bk_3")
            .user(user)
            .spot(sp3)
            .slotId(sp3.getSlotId())
            .vehicle(veh3)
            .pricingRule(pr3)
            .bookingCode("PSF-90873")
            .bookingDate(now.toLocalDate())
            .bookedStartTime(now.minusHours(2))
            .bookedEndTime(now.plusHours(2))
            .bookedAmount(BigDecimal.valueOf(240))
            .lateFee(BigDecimal.ZERO)
            .totalAmount(BigDecimal.valueOf(240))
            .bookingStatus(BookingStatus.ACTIVE)
            .locationTag("Airport")
            .createdAt(now.minusHours(6))
            .build());

        Booking bk4 = bookingRepository.save(Booking.builder()
            .bookingId("bk_4")
            .user(user)
            .spot(sp4)
            .slotId(sp4.getSlotId())
            .vehicle(veh1)
            .pricingRule(pr4)
            .bookingCode("PSF-90874")
            .bookingDate(now.plusDays(3).toLocalDate())
            .bookedStartTime(now.plusDays(3).withHour(8).withMinute(0))
            .bookedEndTime(now.plusDays(3).withHour(11).withMinute(0))
            .bookedAmount(BigDecimal.valueOf(360))
            .lateFee(BigDecimal.ZERO)
            .totalAmount(BigDecimal.valueOf(360))
            .bookingStatus(BookingStatus.UPCOMING)
            .locationTag("Anna Nagar")
            .createdAt(now.minusHours(5))
            .build());

        Booking bk5 = bookingRepository.save(Booking.builder()
            .bookingId("bk_5")
            .user(user)
            .spot(sp5)
            .slotId(sp5.getSlotId())
            .vehicle(veh2)
            .pricingRule(pr5)
            .bookingCode("PSF-90875")
            .bookingDate(now.minusDays(11).toLocalDate())
            .bookedStartTime(now.minusDays(11).withHour(12).withMinute(0))
            .bookedEndTime(now.minusDays(11).withHour(14).withMinute(0))
            .bookedAmount(BigDecimal.valueOf(100))
            .lateFee(BigDecimal.ZERO)
            .totalAmount(BigDecimal.valueOf(100))
            .bookingStatus(BookingStatus.CANCELLED)
            .locationTag("Velachery")
            .createdAt(now.minusDays(12))
            .build());

        createHold("hold_1", sp1, user, now.minusMinutes(20), now.plusMinutes(10), HoldStatus.ACTIVE, BigDecimal.valueOf(80));
        createHold("hold_2", sp1, user2, now.minusDays(2).withHour(9).withMinute(0), now.minusDays(2).withHour(9).withMinute(15), HoldStatus.CONSUMED, BigDecimal.valueOf(100));
        createHold("hold_3", sp2, user, now.minusDays(1).withHour(11).withMinute(0), now.minusDays(1).withHour(11).withMinute(10), HoldStatus.EXPIRED, BigDecimal.valueOf(70));
        createHold("hold_4", sp4, user2, now.minusHours(3), now.minusHours(2), HoldStatus.CANCELLED, BigDecimal.valueOf(120));
        createHold("hold_5", sp5, user2, now.plusDays(1).withHour(7).withMinute(30), now.plusDays(1).withHour(7).withMinute(45), HoldStatus.ACTIVE, BigDecimal.valueOf(90));

        Payment pay1 = paymentRepository.save(Payment.builder()
            .paymentId("pay_1")
            .booking(bk1)
            .paymentMethod(PaymentMethod.WALLET)
            .amountPaid(BigDecimal.valueOf(320))
            .paymentStatus(PaymentStatus.PAID)
            .transactionRef("TXN-PSF-90871")
            .paidAt(now.minusDays(9).withHour(13).withMinute(30))
            .build());

        Payment pay2 = paymentRepository.save(Payment.builder()
            .paymentId("pay_2")
            .booking(bk2)
            .paymentMethod(PaymentMethod.WALLET)
            .amountPaid(BigDecimal.valueOf(175))
            .paymentStatus(PaymentStatus.PAID)
            .transactionRef("TXN-PSF-90872")
            .paidAt(now.minusDays(3).withHour(11).withMinute(52))
            .build());

        Payment pay3 = paymentRepository.save(Payment.builder()
            .paymentId("pay_3")
            .booking(bk3)
            .paymentMethod(PaymentMethod.WALLET)
            .amountPaid(BigDecimal.valueOf(240))
            .paymentStatus(PaymentStatus.RESERVED)
            .transactionRef("TXN-PSF-90873")
            .paidAt(now.minusHours(6))
            .build());

        Payment pay4 = paymentRepository.save(Payment.builder()
            .paymentId("pay_4")
            .booking(bk4)
            .paymentMethod(PaymentMethod.WALLET)
            .amountPaid(BigDecimal.valueOf(360))
            .paymentStatus(PaymentStatus.RESERVED)
            .transactionRef("TXN-PSF-90874")
            .paidAt(now.minusHours(5))
            .build());

        Payment pay5 = paymentRepository.save(Payment.builder()
            .paymentId("pay_5")
            .booking(bk5)
            .paymentMethod(PaymentMethod.WALLET)
            .amountPaid(BigDecimal.valueOf(100))
            .paymentStatus(PaymentStatus.REFUNDED)
            .transactionRef("TXN-PSF-90875")
            .paidAt(now.minusDays(11).withHour(14).withMinute(5))
            .build());

        WalletTransaction wtxn1 = walletTransactionRepository.save(WalletTransaction.builder()
            .walletTxnId("wtxn_1")
            .wallet(wallet)
            .transactionType(TransactionType.CREDIT)
            .amount(BigDecimal.valueOf(2000))
            .referenceType(ReferenceType.TOPUP)
            .referenceId("TOPUP-20260301")
            .transactionStatus(TransactionStatus.SUCCESS)
            .description("Wallet top-up via UPI")
            .createdAt(now.minusDays(10))
            .build());

        WalletTransaction wtxn2 = walletTransactionRepository.save(WalletTransaction.builder()
            .walletTxnId("wtxn_2")
            .wallet(wallet)
            .transactionType(TransactionType.DEBIT)
            .amount(BigDecimal.valueOf(320))
            .referenceType(ReferenceType.BOOKING)
            .referenceId("bk_1")
            .transactionStatus(TransactionStatus.SUCCESS)
            .description("Payment for booking PSF-90871")
            .createdAt(now.minusDays(9))
            .build());

        WalletTransaction wtxn3 = walletTransactionRepository.save(WalletTransaction.builder()
            .walletTxnId("wtxn_3")
            .wallet(wallet)
            .transactionType(TransactionType.DEBIT)
            .amount(BigDecimal.valueOf(175))
            .referenceType(ReferenceType.BOOKING)
            .referenceId("bk_2")
            .transactionStatus(TransactionStatus.SUCCESS)
            .description("Payment for booking PSF-90872")
            .createdAt(now.minusDays(3))
            .build());

        WalletTransaction wtxn4 = walletTransactionRepository.save(WalletTransaction.builder()
            .walletTxnId("wtxn_4")
            .wallet(wallet)
            .transactionType(TransactionType.DEBIT)
            .amount(BigDecimal.valueOf(240))
            .referenceType(ReferenceType.BOOKING)
            .referenceId("bk_3")
            .transactionStatus(TransactionStatus.SUCCESS)
            .description("Reserved payment for booking PSF-90873")
            .createdAt(now.minusHours(6))
            .build());

        WalletTransaction wtxn5 = walletTransactionRepository.save(WalletTransaction.builder()
            .walletTxnId("wtxn_5")
            .wallet(wallet)
            .transactionType(TransactionType.CREDIT)
            .amount(BigDecimal.valueOf(100))
            .referenceType(ReferenceType.REFUND)
            .referenceId("bk_5")
            .transactionStatus(TransactionStatus.SUCCESS)
            .description("Refund for cancelled booking PSF-90875")
            .createdAt(now.minusDays(11))
            .build());

        WalletTransaction wtxn6 = walletTransactionRepository.save(WalletTransaction.builder()
            .walletTxnId("wtxn_6")
            .wallet(wallet5)
            .transactionType(TransactionType.DEBIT)
            .amount(BigDecimal.valueOf(360))
            .referenceType(ReferenceType.BOOKING)
            .referenceId("bk_4")
            .transactionStatus(TransactionStatus.SUCCESS)
            .description("Reserved payment for booking PSF-90874")
            .createdAt(now.minusHours(5))
            .build());

        WalletTransaction wtxn7 = walletTransactionRepository.save(WalletTransaction.builder()
            .walletTxnId("wtxn_7")
            .wallet(wallet)
            .transactionType(TransactionType.DEBIT)
            .amount(BigDecimal.valueOf(100))
            .referenceType(ReferenceType.BOOKING)
            .referenceId("bk_5")
            .transactionStatus(TransactionStatus.SUCCESS)
            .description("Payment for booking PSF-90875")
            .createdAt(now.minusDays(11).withHour(14).withMinute(0))
            .build());

        bookingHistoryRepository.saveAll(List.of(
            BookingHistory.builder().historyId("bh_1").booking(bk1).newStatus(BookingStatus.ACTIVE).changedAt(now.minusDays(10)).remarks("Booking created.").build(),
            BookingHistory.builder().historyId("bh_2").booking(bk1).oldStatus(BookingStatus.ACTIVE).newStatus(BookingStatus.COMPLETED).changedAt(now.minusDays(9)).remarks("Driver checked out. Late fee applied.").build(),
            BookingHistory.builder().historyId("bh_3").booking(bk3).newStatus(BookingStatus.UPCOMING).changedAt(now.minusHours(7)).remarks("Upcoming booking confirmed.").build(),
            BookingHistory.builder().historyId("bh_4").booking(bk3).oldStatus(BookingStatus.UPCOMING).newStatus(BookingStatus.ACTIVE).changedAt(now.minusHours(2)).remarks("Booking started.").build(),
            BookingHistory.builder().historyId("bh_5").booking(bk5).oldStatus(BookingStatus.UPCOMING).newStatus(BookingStatus.CANCELLED).changedAt(now.minusDays(11)).remarks("Cancelled by user.").build()
        ));

        reviewRepository.saveAll(List.of(
            Review.builder().reviewId("rev_1").booking(bk1).spot(sp1).user(user).rating(5).reviewText("Very secure and easy entry. Will book again.").createdAt(now.minusDays(8)).build(),
            Review.builder().reviewId("rev_2").booking(bk2).spot(sp2).user(user).rating(4).reviewText("Great location, slightly busy during peak hours.").createdAt(now.minusDays(3)).build(),
            Review.builder().reviewId("rev_3").booking(bk3).spot(sp3).user(user).rating(5).reviewText("Fast entry and clean lanes near the terminal.").createdAt(now.minusHours(1)).build(),
            Review.builder().reviewId("rev_4").booking(bk4).spot(sp4).user(user2).rating(4).reviewText("Well marked slots and easy navigation.").createdAt(now.minusMinutes(30)).build(),
            Review.builder().reviewId("rev_5").booking(bk5).spot(sp5).user(user).rating(3).reviewText("Cancelled due to schedule change, refund was quick.").createdAt(now.minusDays(10)).build()
        ));
    }

    private boolean hasSeededMinimumData() {
        return appUserRepository.count() >= 5
            && vehicleRepository.count() >= 5
            && walletAccountRepository.count() >= 5
            && walletTransactionRepository.count() >= 5
            && parkingSpotRepository.count() >= 5
            && spotImageRepository.count() >= 5
            && spotAvailabilityRepository.count() >= 5
            && spotApprovalRepository.count() >= 5
            && pricingRuleRepository.count() >= 5
            && reservationHoldRepository.count() >= 5
            && bookingRepository.count() >= 5
            && paymentRepository.count() >= 5
            && bookingHistoryRepository.count() >= 5
            && reviewRepository.count() >= 5;
    }

    private ParkingSpot createSpot(String id, AppUser lender, String title, String address, String locality, String city,
                                   SpotType type, SpotStatus status, double latitude, double longitude,
                                   Set<VehicleType> vehicleTypes, int slots, LocalDateTime createdAt, double distance,
                                   String slotId, String slotCode, SlotStatus slotStatus, boolean deviceOpen) {
        return ParkingSpot.builder()
            .spotId(id)
            .lender(lender)
            .spotTitle(title)
            .description("Verified parking spot with CCTV and easy access.")
            .addressLine(address)
            .locality(locality)
            .city(city)
            .state("Tamil Nadu")
            .pincode("600001")
            .latitude(BigDecimal.valueOf(latitude))
            .longitude(BigDecimal.valueOf(longitude))
            .vehicleTypeAllowed(vehicleTypes)
            .totalSlots(slots)
            .slotId(slotId)
            .slotCode(slotCode)
            .slotLabel(slotCode)
            .slotStatus(slotStatus)
            .deviceOpen(deviceOpen)
            .spotType(type)
            .spotStatus(status)
            .distanceKm(BigDecimal.valueOf(distance))
            .createdAt(createdAt)
            .build();
    }

    private void createImage(String id, ParkingSpot spot, String url, boolean primary, LocalDateTime uploadedAt) {
        spotImageRepository.save(SpotImage.builder()
            .imageId(id)
            .spot(spot)
            .imageUrl(url)
            .imageCaption("Spot image")
            .primary(primary)
            .uploadedAt(uploadedAt)
            .build());
    }

    private void createAvailability(String id, ParkingSpot spot, String dayOfWeek, String start, String end, boolean available) {
        spotAvailabilityRepository.save(SpotAvailability.builder()
            .availabilityId(id)
            .spot(spot)
            .dayOfWeek(dayOfWeek)
            .startTime(LocalTime.parse(start))
            .endTime(LocalTime.parse(end))
            .available(available)
            .build());
    }

    private void createApproval(String id, ParkingSpot spot, AppUser admin, ApprovalStatus status, String reason, LocalDateTime submitted, LocalDateTime reviewed) {
        spotApprovalRepository.save(SpotApproval.builder()
            .approvalId(id)
            .spot(spot)
            .admin(admin)
            .approvalStatus(status)
            .rejectionReason(reason)
            .submittedAt(submitted)
            .reviewedAt(reviewed)
            .build());
    }

    private PricingRule createPricing(String id, ParkingSpot spot, BigDecimal base, BigDecimal peak, BigDecimal special, RuleStatus status, LocalDateTime createdAt) {
        PricingRule rule = PricingRule.builder()
            .pricingRuleId(id)
            .spot(spot)
            .pricingType(PricingType.HOURLY)
            .baseHourlyRate(base)
            .peakHourRate(peak)
            .specialDayRate(special)
            .suggestedBaseHourlyRate(base)
            .suggestedPeakHourRate(peak)
            .suggestedSpecialDayRate(special)
            .effectiveFrom(LocalDate.now().minusMonths(2))
            .effectiveTo(LocalDate.now().plusMonths(10))
            .ruleStatus(status)
            .createdBy("usr_admin_1")
            .createdAt(createdAt)
            .build();
        return pricingRuleRepository.save(rule);
    }

    private void createHold(String id, ParkingSpot spot, AppUser user, LocalDateTime holdStart, LocalDateTime holdExpiry,
                            HoldStatus status, BigDecimal amount) {
        reservationHoldRepository.save(ReservationHold.builder()
            .holdId(id)
            .spot(spot)
            .slotId(spot.getSlotId())
            .user(user)
            .holdStartTime(holdStart)
            .holdExpiryTime(holdExpiry)
            .holdStatus(status)
            .reservedAmount(amount)
            .build());
    }
}
