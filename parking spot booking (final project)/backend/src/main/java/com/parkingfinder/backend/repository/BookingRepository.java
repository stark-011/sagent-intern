package com.parkingfinder.backend.repository;

import com.parkingfinder.backend.entity.Booking;
import com.parkingfinder.backend.enums.BookingStatus;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, String> {

    List<Booking> findByUserUserIdOrderByCreatedAtDesc(String userId);

    @Query("""
        select b from Booking b
        where b.slotId = :slotId
          and b.bookingStatus in :statuses
          and b.bookedStartTime < :endTime
          and (
                case
                    when b.actualCheckoutTime is not null
                     and b.actualCheckoutTime > coalesce(b.bufferEndTime, b.bookedEndTime)
                        then b.actualCheckoutTime
                    else coalesce(b.bufferEndTime, b.bookedEndTime)
                end
          ) > :startTime
        """)
    List<Booking> findOverlappingBookings(
        @Param("slotId") String slotId,
        @Param("statuses") Collection<BookingStatus> statuses,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );

    @Query("""
        select b from Booking b
        where b.spot.spotId = :spotId
          and b.bookingStatus in :statuses
          and b.bookedStartTime < :endTime
          and (
                case
                    when b.actualCheckoutTime is not null
                     and b.actualCheckoutTime > coalesce(b.bufferEndTime, b.bookedEndTime)
                        then b.actualCheckoutTime
                    else coalesce(b.bufferEndTime, b.bookedEndTime)
                end
          ) > :startTime
        order by b.bookedStartTime asc
        """)
    List<Booking> findSpotBookedWindows(
        @Param("spotId") String spotId,
        @Param("statuses") Collection<BookingStatus> statuses,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );

    @Query("""
        select b from Booking b
        where b.spot.spotId = :spotId
          and b.bookingStatus in :statuses
          and (
                case
                    when b.actualCheckoutTime is not null
                     and b.actualCheckoutTime > coalesce(b.bufferEndTime, b.bookedEndTime)
                        then b.actualCheckoutTime
                    else coalesce(b.bufferEndTime, b.bookedEndTime)
                end
          ) > :fromTime
        order by b.bookedStartTime asc
        """)
    List<Booking> findFutureSpotBookings(
        @Param("spotId") String spotId,
        @Param("statuses") Collection<BookingStatus> statuses,
        @Param("fromTime") LocalDateTime fromTime
    );

    @Query("select b from Booking b where b.spot.lender.userId = :lenderId order by b.createdAt desc")
    List<Booking> findByLenderUserIdOrderByCreatedAtDesc(@Param("lenderId") String lenderId);

    @Query("select b.bookingStatus, count(b) from Booking b group by b.bookingStatus")
    List<Object[]> countBookingsGroupedByStatus();

    /** Count bookings filtered by a single status (avoids loading all bookings). */
    long countByBookingStatus(BookingStatus status);

    boolean existsBySlotId(String slotId);

    boolean existsBySpotSpotId(String spotId);
}
