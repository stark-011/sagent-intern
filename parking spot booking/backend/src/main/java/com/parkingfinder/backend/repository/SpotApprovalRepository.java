package com.parkingfinder.backend.repository;

import com.parkingfinder.backend.entity.SpotApproval;
import com.parkingfinder.backend.enums.ApprovalStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface SpotApprovalRepository extends JpaRepository<SpotApproval, String> {

    Optional<SpotApproval> findBySpotSpotId(String spotId);

    List<SpotApproval> findByApprovalStatus(ApprovalStatus approvalStatus);

    @Query("select sa.approvalStatus, count(sa) from SpotApproval sa group by sa.approvalStatus")
    List<Object[]> countApprovalsGroupedByStatus();

    void deleteBySpotSpotId(String spotId);
}
