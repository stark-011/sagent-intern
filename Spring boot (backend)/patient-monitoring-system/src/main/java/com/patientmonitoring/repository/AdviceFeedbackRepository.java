package com.patientmonitoring.repository;

import com.patientmonitoring.entity.AdviceFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdviceFeedbackRepository extends JpaRepository<AdviceFeedback, String> {
    List<AdviceFeedback> findByPatientIdOrderBySentAtDesc(String patientId);
    List<AdviceFeedback> findByDoctorIdOrderBySentAtDesc(String doctorId);
    List<AdviceFeedback> findByPatientIdAndIsReadFalse(String patientId);
}