package com.parkingfinder.backend.repository;

import com.parkingfinder.backend.entity.BookingHistory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingHistoryRepository extends JpaRepository<BookingHistory, String> {

    List<BookingHistory> findByBookingBookingIdOrderByChangedAtAsc(String bookingId);
}
