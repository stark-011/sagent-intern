package com.patientmonitoring.repository;

import com.patientmonitoring.entity.PastRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PastRecordRepository extends JpaRepository<PastRecord, String> {
    List<PastRecord> findByPatientId(String patientId);
}