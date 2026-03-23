package com.parkingfinder.backend.repository;

import com.parkingfinder.backend.entity.Payment;
import com.parkingfinder.backend.enums.PaymentStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PaymentRepository extends JpaRepository<Payment, String> {

    Optional<Payment> findByBookingBookingId(String bookingId);

    /** Sum of all amountPaid across every payment row (for dashboard totals). */
    @Query("select coalesce(sum(p.amountPaid), 0) from Payment p")
    java.math.BigDecimal sumAllAmountsPaid();

    @Query("""
        select year(p.paidAt), month(p.paidAt), coalesce(sum(p.amountPaid), 0)
        from Payment p
        where p.paymentStatus = :status
          and p.paidAt is not null
        group by year(p.paidAt), month(p.paidAt)
        order by year(p.paidAt), month(p.paidAt)
        """)
    List<Object[]> summarizePaidAmountsByMonth(@Param("status") PaymentStatus status);
}
