package com.parkingfinder.backend.service.impl;

import com.parkingfinder.backend.dto.parking.PricingRuleDto;
import com.parkingfinder.backend.dto.parking.SpotAvailabilityDto;
import com.parkingfinder.backend.dto.parking.SpotAvailabilityRequest;
import com.parkingfinder.backend.dto.parking.SpotApprovalDto;
import com.parkingfinder.backend.dto.parking.SpotBookedWindowDto;
import com.parkingfinder.backend.dto.parking.SpotCreateRequest;
import com.parkingfinder.backend.dto.parking.SpotImageDto;
import com.parkingfinder.backend.dto.parking.SpotImageRequest;
import com.parkingfinder.backend.dto.parking.PublicStatsResponse;
import com.parkingfinder.backend.dto.parking.SpotResponse;
import com.parkingfinder.backend.dto.parking.SpotSlotDto;
import com.parkingfinder.backend.dto.parking.SpotUpdateRequest;
import com.parkingfinder.backend.dto.user.UserResponse;
import com.parkingfinder.backend.entity.AppUser;
import com.parkingfinder.backend.entity.Booking;
import com.parkingfinder.backend.entity.ParkingSpot;
import com.parkingfinder.backend.entity.PricingRule;
import com.parkingfinder.backend.entity.SpotApproval;
import com.parkingfinder.backend.entity.SpotAvailability;
import com.parkingfinder.backend.entity.SpotImage;
import com.parkingfinder.backend.enums.AccountStatus;
import com.parkingfinder.backend.enums.ApprovalStatus;
import com.parkingfinder.backend.enums.BookingStatus;
import com.parkingfinder.backend.enums.PricingType;
import com.parkingfinder.backend.enums.RuleStatus;
import com.parkingfinder.backend.enums.SlotStatus;
import com.parkingfinder.backend.enums.SpotStatus;
import com.parkingfinder.backend.enums.SpotType;
import com.parkingfinder.backend.enums.VehicleType;
import com.parkingfinder.backend.enums.UserRole;
import com.parkingfinder.backend.exception.BadRequestException;
import com.parkingfinder.backend.exception.ResourceNotFoundException;
import com.parkingfinder.backend.mapper.SpotMapper;
import com.parkingfinder.backend.mapper.UserMapper;
import com.parkingfinder.backend.repository.AppUserRepository;
import com.parkingfinder.backend.repository.BookingRepository;
import com.parkingfinder.backend.repository.ParkingSpotRepository;
import com.parkingfinder.backend.repository.PricingRuleRepository;
import com.parkingfinder.backend.repository.ReservationHoldRepository;
import com.parkingfinder.backend.repository.ReviewRepository;
import com.parkingfinder.backend.repository.SpotApprovalRepository;
import com.parkingfinder.backend.repository.SpotAvailabilityRepository;
import com.parkingfinder.backend.repository.SpotImageRepository;
import com.parkingfinder.backend.service.ParkingService;
import com.parkingfinder.backend.util.IdGenerator;
import com.parkingfinder.backend.util.BookingProtectionUtil;
import com.parkingfinder.backend.util.SecurityUtils;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ParkingServiceImpl implements ParkingService {

    private static final String DEFAULT_IMAGE = "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80";
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter BOOKING_WINDOW_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy hh:mm a", Locale.ENGLISH);
    private static final int SINGLE_SLOT_COUNT = 1;
    private static final List<BookingStatus> PROTECTED_BOOKING_STATUSES = List.of(
        BookingStatus.ACTIVE,
        BookingStatus.UPCOMING,
        BookingStatus.COMPLETED,
        BookingStatus.OVERSTAY
    );

    private final ParkingSpotRepository parkingSpotRepository;
    private final SpotImageRepository spotImageRepository;
    private final SpotAvailabilityRepository spotAvailabilityRepository;
    private final SpotApprovalRepository spotApprovalRepository;
    private final PricingRuleRepository pricingRuleRepository;
    private final ReviewRepository reviewRepository;
    private final SpotMapper spotMapper;
    private final UserMapper userMapper;
    private final AppUserRepository appUserRepository;
    private final BookingRepository bookingRepository;
    private final ReservationHoldRepository reservationHoldRepository;

    @Override
    public List<SpotResponse> getAllSpots() {
        return parkingSpotRepository.findAll().stream()
            .map(this::toFullSpot)
            .toList();
    }

    @Override
    public PublicStatsResponse getPublicStats() {
        long totalSpots = parkingSpotRepository.count();
        long activeDrivers = appUserRepository.countByRoleAndAccountStatus(UserRole.DRIVER, AccountStatus.ACTIVE);
        long totalLenders = appUserRepository.countByRoleAndAccountStatus(UserRole.LENDER, AccountStatus.ACTIVE);
        long totalCities = parkingSpotRepository.countDistinctCities();

        return PublicStatsResponse.builder()
            .totalSpots(totalSpots)
            .activeDrivers(activeDrivers)
            .totalLenders(totalLenders)
            .totalCities(totalCities)
            .build();
    }

    @Override
    public List<SpotResponse> getFeaturedSpots() {
        return parkingSpotRepository.findAll().stream()
            .map(this::toFullSpot)
            .filter(spot -> "approved".equals(spot.getApprovalStatus()) && spot.isFinalPriceSet())
            .sorted(Comparator.comparing(SpotResponse::getRating, Comparator.nullsLast(Comparator.reverseOrder())))
            .limit(4)
            .toList();
    }

    @Override
    public List<SpotResponse> searchSpots(
        String query,
        String vehicleType,
        String maxPrice,
        String spotType,
        String minRating,
        String maxDistance,
        String sort,
        String startTime,
        String endTime,
        String status
    ) {
        List<SpotResponse> spots = parkingSpotRepository.findAll().stream()
            .map(this::toFullSpot)
            .filter(spot -> "approved".equals(spot.getApprovalStatus()) && spot.isFinalPriceSet())
            .toList();

        if (query != null && !query.isBlank()) {
            String q = query.toLowerCase(Locale.ROOT);
            spots = spots.stream()
                .filter(spot -> (spot.getCity() + " " + spot.getLocality() + " " + spot.getAddressLine() + " " + spot.getSpotTitle())
                    .toLowerCase(Locale.ROOT)
                    .contains(q))
                .toList();
        }

        if (vehicleType != null && !vehicleType.isBlank()) {
            spots = spots.stream()
                .filter(spot -> spot.getVehicleTypeAllowed().stream().anyMatch(v -> v.equalsIgnoreCase(vehicleType)))
                .toList();
        }

        if (spotType != null && !spotType.isBlank()) {
            spots = spots.stream().filter(spot -> Objects.equals(spot.getSpotType(), spotType)).toList();
        }

        if (status != null && !status.isBlank()) {
            spots = spots.stream().filter(spot -> Objects.equals(spot.getSpotStatus(), status)).toList();
        }

        if (minRating != null && !minRating.isBlank()) {
            double rating = Double.parseDouble(minRating);
            spots = spots.stream().filter(spot -> (spot.getRating() != null ? spot.getRating() : 0d) >= rating).toList();
        }

        if (maxDistance != null && !maxDistance.isBlank()) {
            BigDecimal max = new BigDecimal(maxDistance);
            spots = spots.stream()
                .filter(spot -> spot.getDistanceKm() == null || spot.getDistanceKm().compareTo(max) <= 0)
                .toList();
        }

        if (maxPrice != null && !maxPrice.isBlank()) {
            BigDecimal max = new BigDecimal(maxPrice);
            spots = spots.stream()
                .filter(spot -> spot.getPricePerHour() != null && spot.getPricePerHour().compareTo(max) <= 0)
                .toList();
        }

        if (startTime != null && !startTime.isBlank() && endTime != null && !endTime.isBlank()) {
            LocalTime start = LocalTime.parse(startTime);
            LocalTime end = LocalTime.parse(endTime);
            spots = spots.stream()
                .filter(spot -> spot.getAvailability().stream().anyMatch(window ->
                    !window.getStartTime().isAfter(start) && !window.getEndTime().isBefore(end)
                ))
                .toList();
        }

        String sortKey = sort == null || sort.isBlank() ? "nearest" : sort;
        return switch (sortKey) {
            case "lowest_price" -> spots.stream()
                .sorted(Comparator.comparing(SpotResponse::getPricePerHour, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
            case "highest_rated" -> spots.stream()
                .sorted(Comparator.comparing(SpotResponse::getRating, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
            case "newest" -> spots.stream()
                .sorted(Comparator.comparing(SpotResponse::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
            default -> spots.stream()
                .sorted(Comparator.comparing(SpotResponse::getDistanceKm, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
        };
    }

    @Override
    public SpotResponse getSpotById(String spotId) {
        ParkingSpot spot = parkingSpotRepository.findById(spotId)
            .orElseThrow(() -> new ResourceNotFoundException("Parking spot not found"));
        return toFullSpot(spot);
    }

    @Override
    public List<SpotBookedWindowDto> getSpotBookedWindows(String spotId, LocalDate date) {
        parkingSpotRepository.findById(spotId)
            .orElseThrow(() -> new ResourceNotFoundException("Parking spot not found"));
        LocalDate targetDate = date != null ? date : LocalDate.now();
        LocalDateTime dayStart = targetDate.atStartOfDay();
        LocalDateTime dayEnd = dayStart.plusDays(1);

        return bookingRepository.findSpotBookedWindows(
                spotId,
                PROTECTED_BOOKING_STATUSES,
                dayStart,
                dayEnd
            )
            .stream()
            .map(booking -> SpotBookedWindowDto.builder()
                .bookingId(booking.getBookingId())
                .slotId(booking.getSlotId())
                .bookedStartTime(booking.getBookedStartTime())
                .bookedEndTime(booking.getBookedEndTime())
                .bufferMinutes(booking.getBufferMinutes())
                .bufferEndTime(booking.getBufferEndTime())
                .blockedUntilTime(resolveBlockedUntil(booking))
                .bookingStatus(booking.getBookingStatus().getValue())
                .build())
            .toList();
    }

    @Override
    public List<SpotResponse> findAlternativeSpots(String spotId, LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime == null || endTime == null || !endTime.isAfter(startTime)) {
            throw new BadRequestException("Invalid booking time window");
        }

        ParkingSpot sourceSpot = parkingSpotRepository.findById(spotId)
            .orElseThrow(() -> new ResourceNotFoundException("Parking spot not found"));

        List<ParkingSpot> candidates = parkingSpotRepository.findAll().stream()
            .filter(candidate -> !candidate.getSpotId().equals(spotId))
            .filter(candidate -> candidate.getSpotStatus() == SpotStatus.ACTIVE)
            .toList();

        List<ParkingSpot> sameCityCandidates = candidates.stream()
            .filter(candidate -> equalsIgnoreCase(candidate.getCity(), sourceSpot.getCity()))
            .toList();
        List<ParkingSpot> scopedCandidates = sameCityCandidates.isEmpty() ? candidates : sameCityCandidates;

        return scopedCandidates.stream()
            .map(this::toFullSpot)
            .filter(spot -> "approved".equalsIgnoreCase(spot.getApprovalStatus()) && spot.isFinalPriceSet())
            .filter(spot -> isSpotOpenForRange(spot, startTime, endTime))
            .filter(spot -> isSpotRangeUnblocked(spot.getSpotId(), startTime, endTime))
            .sorted(Comparator
                .comparing((SpotResponse spot) -> !equalsIgnoreCase(spot.getLocality(), sourceSpot.getLocality()))
                .thenComparing(spot -> calculateDistanceScore(sourceSpot, spot))
                .thenComparing(SpotResponse::getPricePerHour, Comparator.nullsLast(Comparator.naturalOrder())))
            .limit(4)
            .toList();
    }

    @Override
    public List<SpotResponse> getMyLenderSpots() {
        String lenderId = SecurityUtils.getCurrentUserId();
        return parkingSpotRepository.findByLenderUserIdOrderByCreatedAtDesc(lenderId)
            .stream()
            .map(this::toFullSpot)
            .toList();
    }

    @Override
    public SpotResponse getMyLenderSpotById(String spotId) {
        String lenderId = SecurityUtils.getCurrentUserId();
        ParkingSpot spot = parkingSpotRepository.findBySpotIdAndLenderUserId(spotId, lenderId)
            .orElseThrow(() -> new ResourceNotFoundException("Spot not found"));
        return toFullSpot(spot);
    }

    @Override
    @Transactional
    public SpotResponse createSpot(SpotCreateRequest request) {
        String lenderId = SecurityUtils.getCurrentUserId();
        AppUser lender = appUserRepository.findById(lenderId)
            .orElseThrow(() -> new ResourceNotFoundException("Lender not found"));

        ParkingSpot spot = ParkingSpot.builder()
            .spotId(IdGenerator.generate("sp"))
            .lender(lender)
            .spotTitle(request.getSpotTitle())
            .description(request.getDescription())
            .addressLine(request.getAddressLine())
            .locality(request.getLocality())
            .city(request.getCity())
            .state(request.getState())
            .pincode(request.getPincode())
            .latitude(request.getLatitude())
            .longitude(request.getLongitude())
            .vehicleTypeAllowed(request.getVehicleTypeAllowed().stream().map(VehicleType::fromValue).collect(java.util.stream.Collectors.toSet()))
            .totalSlots(SINGLE_SLOT_COUNT)
            .slotId(IdGenerator.generate("slot"))
            .slotCode("S-01")
            .slotLabel("Primary Slot")
            .slotStatus(SlotStatus.AVAILABLE)
            .deviceOpen(false)
            .spotType(SpotType.fromValue(request.getSpotType()))
            .spotStatus(SpotStatus.INACTIVE)
            .distanceKm(BigDecimal.valueOf(1 + Math.random() * 10).setScale(1, RoundingMode.HALF_UP))
            .createdAt(LocalDateTime.now())
            .build();
        parkingSpotRepository.save(spot);

        spotImageRepository.save(SpotImage.builder()
            .imageId(IdGenerator.generate("img"))
            .spot(spot)
            .imageUrl(request.getImageUrl() != null && !request.getImageUrl().isBlank() ? request.getImageUrl() : DEFAULT_IMAGE)
            .imageCaption("Primary image")
            .primary(true)
            .uploadedAt(LocalDateTime.now())
            .build());

        SpotAvailability availability = SpotAvailability.builder()
            .availabilityId(IdGenerator.generate("avail"))
            .spot(spot)
            .dayOfWeek(request.getDayOfWeek() != null ? request.getDayOfWeek() : "all")
            .startTime(parseTimeOrDefault(request.getStartTime(), "06:00"))
            .endTime(parseTimeOrDefault(request.getEndTime(), "23:00"))
            .effectiveFrom(LocalDate.now())
            .effectiveTo(LocalDate.now().plusYears(1))
            .available(true)
            .build();
        spotAvailabilityRepository.save(availability);

        pricingRuleRepository.save(PricingRule.builder()
            .pricingRuleId(IdGenerator.generate("pr"))
            .spot(spot)
            .pricingType(request.getPricingType() != null ? PricingType.fromValue(request.getPricingType()) : PricingType.HOURLY)
            .baseHourlyRate(null)
            .peakHourRate(null)
            .specialDayRate(null)
            .suggestedBaseHourlyRate(request.getBaseHourlyRate())
            .suggestedPeakHourRate(request.getPeakHourRate() != null ? request.getPeakHourRate() : request.getBaseHourlyRate())
            .suggestedSpecialDayRate(request.getSpecialDayRate() != null ? request.getSpecialDayRate() : request.getBaseHourlyRate())
            .effectiveFrom(request.getEffectiveFrom() != null ? request.getEffectiveFrom() : LocalDate.now())
            .effectiveTo(request.getEffectiveTo() != null ? request.getEffectiveTo() : LocalDate.now().plusYears(1))
            .ruleStatus(RuleStatus.PENDING_ADMIN_PRICING)
            .createdBy(lenderId)
            .createdAt(LocalDateTime.now())
            .build());

        spotApprovalRepository.save(SpotApproval.builder()
            .approvalId(IdGenerator.generate("appr"))
            .spot(spot)
            .approvalStatus(ApprovalStatus.PENDING)
            .submittedAt(LocalDateTime.now())
            .build());

        return toFullSpot(spot);
    }

    @Override
    @Transactional
    public SpotResponse updateSpot(String spotId, SpotUpdateRequest request) {
        String lenderId = SecurityUtils.getCurrentUserId();
        ParkingSpot spot = parkingSpotRepository.findBySpotIdAndLenderUserId(spotId, lenderId)
            .orElseThrow(() -> new ResourceNotFoundException("Spot not found"));

        if (request.getSpotTitle() != null) {
            spot.setSpotTitle(request.getSpotTitle());
        }
        if (request.getDescription() != null) {
            spot.setDescription(request.getDescription());
        }
        if (request.getAddressLine() != null) {
            spot.setAddressLine(request.getAddressLine());
        }
        if (request.getLocality() != null) {
            spot.setLocality(request.getLocality());
        }
        if (request.getCity() != null) {
            spot.setCity(request.getCity());
        }
        if (request.getState() != null) {
            spot.setState(request.getState());
        }
        if (request.getPincode() != null) {
            spot.setPincode(request.getPincode());
        }
        if (request.getLatitude() != null) {
            spot.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            spot.setLongitude(request.getLongitude());
        }
        if (request.getVehicleTypeAllowed() != null && !request.getVehicleTypeAllowed().isEmpty()) {
            spot.setVehicleTypeAllowed(request.getVehicleTypeAllowed().stream().map(VehicleType::fromValue).collect(java.util.stream.Collectors.toSet()));
        }
        if (request.getTotalSlots() != null && request.getTotalSlots() != SINGLE_SLOT_COUNT) {
            throw new BadRequestException("Only one slot is allowed per parking spot");
        }
        spot.setTotalSlots(SINGLE_SLOT_COUNT);
        if (request.getSpotType() != null) {
            spot.setSpotType(SpotType.fromValue(request.getSpotType()));
        }

        parkingSpotRepository.save(spot);

        if (request.getImageUrl() != null) {
            List<SpotImage> images = spotImageRepository.findBySpotSpotId(spotId);
            if (images.isEmpty()) {
                addSpotImage(spotId, buildImageRequest(request.getImageUrl()));
            } else {
                SpotImage first = images.get(0);
                first.setImageUrl(request.getImageUrl());
                first.setPrimary(true);
                first.setUploadedAt(LocalDateTime.now());
                spotImageRepository.save(first);
            }
        }

        if (request.getDayOfWeek() != null || request.getStartTime() != null || request.getEndTime() != null || request.getIsAvailable() != null) {
            SpotAvailability availability = spotAvailabilityRepository.findBySpotSpotId(spotId).stream().findFirst()
                .orElseGet(() -> SpotAvailability.builder()
                    .availabilityId(IdGenerator.generate("avail"))
                    .spot(spot)
                    .dayOfWeek("all")
                    .startTime(LocalTime.of(6, 0))
                    .endTime(LocalTime.of(23, 0))
                    .effectiveFrom(LocalDate.now())
                    .effectiveTo(LocalDate.now().plusYears(1))
                    .available(true)
                    .build());
            if (request.getDayOfWeek() != null) {
                availability.setDayOfWeek(request.getDayOfWeek());
            }
            if (request.getStartTime() != null) {
                availability.setStartTime(parseTimeOrDefault(request.getStartTime(), "06:00"));
            }
            if (request.getEndTime() != null) {
                availability.setEndTime(parseTimeOrDefault(request.getEndTime(), "23:00"));
            }
            if (request.getIsAvailable() != null) {
                availability.setAvailable(request.getIsAvailable());
            }
            spotAvailabilityRepository.save(availability);
            applyAutomatedDeviceState(spot, availability);
        }

        PricingRule pricingRule = pricingRuleRepository.findTopBySpotSpotIdOrderByCreatedAtDesc(spotId)
            .orElseGet(() -> PricingRule.builder()
                .pricingRuleId(IdGenerator.generate("pr"))
                .spot(spot)
                .pricingType(PricingType.HOURLY)
                .effectiveFrom(LocalDate.now())
                .effectiveTo(LocalDate.now().plusYears(1))
                .ruleStatus(RuleStatus.PENDING_ADMIN_PRICING)
                .createdBy(lenderId)
                .createdAt(LocalDateTime.now())
                .build());

        if (request.getPricingType() != null) {
            pricingRule.setPricingType(PricingType.fromValue(request.getPricingType()));
        }
        if (request.getBaseHourlyRate() != null) {
            pricingRule.setSuggestedBaseHourlyRate(request.getBaseHourlyRate());
        }
        if (request.getPeakHourRate() != null) {
            pricingRule.setSuggestedPeakHourRate(request.getPeakHourRate());
        }
        if (request.getSpecialDayRate() != null) {
            pricingRule.setSuggestedSpecialDayRate(request.getSpecialDayRate());
        }
        if (request.getEffectiveFrom() != null) {
            pricingRule.setEffectiveFrom(request.getEffectiveFrom());
        }
        if (request.getEffectiveTo() != null) {
            pricingRule.setEffectiveTo(request.getEffectiveTo());
        }
        pricingRuleRepository.save(pricingRule);

        return toFullSpot(spot);
    }

    @Override
    @Transactional
    public void deleteSpot(String spotId) {
        ParkingSpot spot = getOwnedSpot(spotId);
        if (bookingRepository.existsBySpotSpotId(spotId)) {
            throw new BadRequestException("Cannot delete parking spot because booking history exists");
        }

        reservationHoldRepository.deleteBySpotSpotId(spotId);
        spotImageRepository.deleteBySpotSpotId(spotId);
        spotAvailabilityRepository.deleteBySpotSpotId(spotId);
        spotApprovalRepository.deleteBySpotSpotId(spotId);
        pricingRuleRepository.deleteBySpotSpotId(spotId);
        reviewRepository.deleteBySpotSpotId(spotId);
        parkingSpotRepository.delete(spot);
    }

    @Override
    @Transactional
    public void updateSpotAvailability(String spotId, SpotAvailabilityRequest request) {
        ParkingSpot spot = getOwnedSpot(spotId);
        SpotAvailability availability = spotAvailabilityRepository.findBySpotSpotId(spotId)
            .stream()
            .findFirst()
            .orElseGet(() -> SpotAvailability.builder()
                .availabilityId(IdGenerator.generate("avail"))
                .spot(spot)
                .effectiveFrom(LocalDate.now())
                .effectiveTo(LocalDate.now().plusYears(1))
                .build());

        String dayOfWeek = request.getDayOfWeek() != null ? request.getDayOfWeek() : "all";
        LocalTime startTime = parseTimeOrDefault(request.getStartTime(), "06:00");
        LocalTime endTime = parseTimeOrDefault(request.getEndTime(), "23:00");
        LocalDate effectiveFrom = request.getEffectiveFrom() != null
            ? request.getEffectiveFrom()
            : availability.getEffectiveFrom() != null ? availability.getEffectiveFrom() : LocalDate.now();
        LocalDate effectiveTo = request.getEffectiveTo() != null
            ? request.getEffectiveTo()
            : availability.getEffectiveTo() != null ? availability.getEffectiveTo() : LocalDate.now().plusYears(1);

        if (!endTime.isAfter(startTime)) {
            throw new BadRequestException("Availability end time must be after start time");
        }
        if (effectiveFrom != null
            && effectiveTo != null
            && effectiveFrom.isAfter(effectiveTo)) {
            throw new BadRequestException("Availability start date must be before end date");
        }
        validateFutureBookingsForAvailabilityChange(
            spot,
            dayOfWeek,
            startTime,
            endTime,
            effectiveFrom,
            effectiveTo,
            request.isAvailable()
        );

        availability.setDayOfWeek(dayOfWeek);
        availability.setStartTime(startTime);
        availability.setEndTime(endTime);
        availability.setEffectiveFrom(effectiveFrom);
        availability.setEffectiveTo(effectiveTo);
        availability.setAvailable(request.isAvailable());
        spotAvailabilityRepository.save(availability);
        applyAutomatedDeviceState(spot, availability);
    }

    @Transactional
    public void syncSpotDeviceAutomation(String spotId) {
        ParkingSpot spot = parkingSpotRepository.findById(spotId)
            .orElseThrow(() -> new ResourceNotFoundException("Spot not found"));
        SpotAvailability availability = spotAvailabilityRepository.findBySpotSpotId(spotId)
            .stream()
            .findFirst()
            .orElse(null);
        applyAutomatedDeviceState(spot, availability);
    }

    @Override
    @Transactional
    public void addSpotImage(String spotId, SpotImageRequest request) {
        ParkingSpot spot = getOwnedSpot(spotId);

        if (request.isPrimary()) {
            List<SpotImage> existing = spotImageRepository.findBySpotSpotId(spotId);
            existing.forEach(img -> img.setPrimary(false));
            spotImageRepository.saveAll(existing);
        }

        SpotImage image = SpotImage.builder()
            .imageId(IdGenerator.generate("img"))
            .spot(spot)
            .imageUrl(request.getImageUrl())
            .imageCaption(request.getImageCaption())
            .primary(request.isPrimary())
            .uploadedAt(LocalDateTime.now())
            .build();
        spotImageRepository.save(image);
    }

    private SpotImageRequest buildImageRequest(String imageUrl) {
        SpotImageRequest request = new SpotImageRequest();
        request.setImageUrl(imageUrl);
        request.setPrimary(true);
        request.setImageCaption("Primary image");
        return request;
    }

    private ParkingSpot getOwnedSpot(String spotId) {
        String lenderId = SecurityUtils.getCurrentUserId();
        return parkingSpotRepository.findBySpotIdAndLenderUserId(spotId, lenderId)
            .orElseThrow(() -> new ResourceNotFoundException("Spot not found"));
    }

    private void applyAutomatedDeviceState(ParkingSpot spot, SpotAvailability availability) {
        boolean keepDeviceAccessAllowed = spot.getSpotStatus() == SpotStatus.ACTIVE
            && availability != null
            && availability.isAvailable();
        if (spot.getSlotStatus() == SlotStatus.BLOCKED || !keepDeviceAccessAllowed) {
            spot.setDeviceOpen(false);
            parkingSpotRepository.save(spot);
        }
    }

    private void validateFutureBookingsForAvailabilityChange(
        ParkingSpot spot,
        String dayOfWeek,
        LocalTime startTime,
        LocalTime endTime,
        LocalDate effectiveFrom,
        LocalDate effectiveTo,
        boolean isAvailable
    ) {
        List<Booking> protectedBookings = bookingRepository.findFutureSpotBookings(
            spot.getSpotId(),
            PROTECTED_BOOKING_STATUSES,
            LocalDateTime.now()
        );
        if (protectedBookings.isEmpty()) {
            return;
        }

        Booking conflictingBooking = protectedBookings.stream()
            .filter(booking -> !isBookingCoveredByAvailability(
                booking,
                dayOfWeek,
                startTime,
                endTime,
                effectiveFrom,
                effectiveTo,
                isAvailable
            ))
            .findFirst()
            .orElse(null);

        if (conflictingBooking != null) {
            throw new BadRequestException(buildAvailabilityConflictMessage(conflictingBooking));
        }
    }

    private boolean isBookingCoveredByAvailability(
        Booking booking,
        String dayOfWeek,
        LocalTime startTime,
        LocalTime endTime,
        LocalDate effectiveFrom,
        LocalDate effectiveTo,
        boolean isAvailable
    ) {
        if (!isAvailable || booking.getBookedStartTime() == null || resolveBlockedUntil(booking) == null) {
            return false;
        }

        LocalDate bookingStartDate = booking.getBookedStartTime().toLocalDate();
        LocalDateTime protectedEnd = resolveBlockedUntil(booking);
        LocalDate bookingEndDate = protectedEnd.toLocalDate();
        if (effectiveFrom != null && bookingStartDate.isBefore(effectiveFrom)) {
            return false;
        }
        if (effectiveTo != null && bookingEndDate.isAfter(effectiveTo)) {
            return false;
        }

        if (!matchesAvailabilityDay(dayOfWeek, bookingStartDate) || !matchesAvailabilityDay(dayOfWeek, bookingEndDate)) {
            return false;
        }

        LocalTime bookingStartTime = booking.getBookedStartTime().toLocalTime();
        LocalTime bookingEndTime = protectedEnd.toLocalTime();
        return !bookingStartTime.isBefore(startTime) && !bookingEndTime.isAfter(endTime);
    }

    private boolean matchesAvailabilityDay(String dayOfWeek, LocalDate date) {
        String normalized = dayOfWeek == null || dayOfWeek.isBlank()
            ? "all"
            : dayOfWeek.trim().toLowerCase(Locale.ROOT);

        return switch (normalized) {
            case "all" -> true;
            case "mon-fri" -> date.getDayOfWeek().getValue() >= 1 && date.getDayOfWeek().getValue() <= 5;
            case "mon-sat" -> date.getDayOfWeek().getValue() >= 1 && date.getDayOfWeek().getValue() <= 6;
            case "sat-sun" -> date.getDayOfWeek().getValue() == 6 || date.getDayOfWeek().getValue() == 7;
            default -> true;
        };
    }

    private String buildAvailabilityConflictMessage(Booking booking) {
        String bookingCode = booking.getBookingCode() != null ? booking.getBookingCode() : booking.getBookingId();
        String start = booking.getBookedStartTime() != null
            ? booking.getBookedStartTime().format(BOOKING_WINDOW_FORMATTER)
            : "-";
        LocalDateTime protectedEnd = resolveBlockedUntil(booking);
        String end = protectedEnd != null
            ? protectedEnd.format(BOOKING_WINDOW_FORMATTER)
            : "-";
        return "Availability conflicts with protected booking " + bookingCode + " including its safety buffer (" + start + " - " + end + ")";
    }

    private LocalTime parseTimeOrDefault(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return LocalTime.parse(fallback, TIME_FORMATTER);
        }
        return LocalTime.parse(value, TIME_FORMATTER);
    }

    public SpotResponse toFullSpot(ParkingSpot spot) {
        List<SpotImageDto> images = spotImageRepository.findBySpotSpotId(spot.getSpotId())
            .stream()
            .map(spotMapper::toImageDto)
            .toList();

        List<SpotAvailabilityDto> availability = spotAvailabilityRepository.findBySpotSpotId(spot.getSpotId())
            .stream()
            .map(spotMapper::toAvailabilityDto)
            .toList();

        SpotApprovalDto approvalDto = spotApprovalRepository.findBySpotSpotId(spot.getSpotId())
            .map(spotMapper::toApprovalDto)
            .orElse(null);

        PricingRuleDto pricingDto = pricingRuleRepository.findTopBySpotSpotIdOrderByCreatedAtDesc(spot.getSpotId())
            .map(spotMapper::toPricingDto)
            .orElse(null);

        List<SpotSlotDto> slots = List.of(spotMapper.toSlotDto(spot));

        UserResponse lenderDto = userMapper.toDto(spot.getLender());

        List<com.parkingfinder.backend.entity.Review> reviews = reviewRepository.findBySpotSpotIdOrderByCreatedAtDesc(spot.getSpotId());
        double rating = reviews.isEmpty()
            ? 0d
            : reviews.stream().mapToInt(com.parkingfinder.backend.entity.Review::getRating).average().orElse(0d);

        return spotMapper.toSpotResponse(
            spot,
            images,
            availability,
            approvalDto,
            pricingDto,
            slots,
            lenderDto,
            Math.round(rating * 10.0) / 10.0,
            reviews.size()
        );
    }

    private LocalDateTime resolveBlockedUntil(Booking booking) {
        return BookingProtectionUtil.resolveBlockedUntil(
            booking.getBookedEndTime(),
            booking.getBufferMinutes(),
            booking.getActualCheckoutTime()
        );
    }

    private boolean isSpotRangeUnblocked(String spotId, LocalDateTime startTime, LocalDateTime endTime) {
        return bookingRepository.findSpotBookedWindows(
                spotId,
                PROTECTED_BOOKING_STATUSES,
                startTime,
                endTime
            )
            .isEmpty();
    }

    private boolean isSpotOpenForRange(SpotResponse spot, LocalDateTime startTime, LocalDateTime endTime) {
        if (spot.getAvailability() == null || spot.getAvailability().isEmpty()) {
            return false;
        }
        return spot.getAvailability().stream().anyMatch(window -> {
            if (!window.isAvailable()) {
                return false;
            }
            if (window.getEffectiveFrom() != null && startTime.toLocalDate().isBefore(window.getEffectiveFrom())) {
                return false;
            }
            if (window.getEffectiveTo() != null && endTime.toLocalDate().isAfter(window.getEffectiveTo())) {
                return false;
            }
            if (!matchesAvailabilityDay(window.getDayOfWeek(), startTime.toLocalDate())
                || !matchesAvailabilityDay(window.getDayOfWeek(), endTime.toLocalDate())) {
                return false;
            }
            return !startTime.toLocalTime().isBefore(window.getStartTime())
                && !endTime.toLocalTime().isAfter(window.getEndTime());
        });
    }

    private boolean equalsIgnoreCase(String left, String right) {
        return left != null && right != null && left.equalsIgnoreCase(right);
    }

    private double calculateDistanceScore(ParkingSpot sourceSpot, SpotResponse candidate) {
        if (sourceSpot.getLatitude() == null || sourceSpot.getLongitude() == null
            || candidate.getLatitude() == null || candidate.getLongitude() == null) {
            return candidate.getDistanceKm() != null ? candidate.getDistanceKm().doubleValue() : Double.MAX_VALUE;
        }

        double lat1 = sourceSpot.getLatitude().doubleValue();
        double lon1 = sourceSpot.getLongitude().doubleValue();
        double lat2 = candidate.getLatitude().doubleValue();
        double lon2 = candidate.getLongitude().doubleValue();

        double earthRadiusKm = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
            + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
            * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadiusKm * c;
    }
}
