package com.parkingfinder.backend.repository;

import com.parkingfinder.backend.entity.ReservationHold;
import com.parkingfinder.backend.enums.HoldStatus;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservationHoldRepository extends JpaRepository<ReservationHold, String> {

    List<ReservationHold> findBySlotIdAndHoldStatusAndHoldExpiryTimeAfter(
        String slotId,
        HoldStatus holdStatus,
        LocalDateTime now
    );

    void deleteBySpotSpotId(String spotId);
}
