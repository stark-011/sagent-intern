package com.patientmonitoring.repository;

import com.patientmonitoring.entity.DailyHealthLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DailyHealthLogRepository extends JpaRepository<DailyHealthLog, String> {
    List<DailyHealthLog> findByPatientIdOrderByRecordedAtDesc(String patientId);

    List<DailyHealthLog> findByPatientIdAndRecordedAtBetween(
            String patientId, LocalDateTime start, LocalDateTime end);
}