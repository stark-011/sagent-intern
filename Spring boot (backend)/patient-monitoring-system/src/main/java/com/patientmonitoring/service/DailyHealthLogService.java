package com.patientmonitoring.service;

import com.patientmonitoring.entity.DailyHealthLog;
import com.patientmonitoring.entity.Patient;
import com.patientmonitoring.exception.ResourceNotFoundException;
import com.patientmonitoring.repository.DailyHealthLogRepository;
import com.patientmonitoring.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service class for DailyHealthLog-related business logic.
 * Handles the creation and retrieval of daily health log entries.
 */
@Service
public class DailyHealthLogService {

    private final DailyHealthLogRepository dailyHealthLogRepository;
    private final PatientRepository patientRepository;

    public DailyHealthLogService(DailyHealthLogRepository dailyHealthLogRepository,
                                 PatientRepository patientRepository) {
        this.dailyHealthLogRepository = dailyHealthLogRepository;
        this.patientRepository = patientRepository;
    }

    /**
     * Adds a new DailyHealthLog entry for a given Patient.
     * Validates that the patient exists before saving the log.
     *
     * @param healthLog The health log data (heart rate, BP, oxygen, temperature).
     * @param patientId The ID of the patient this log belongs to.
     * @return The saved DailyHealthLog entity.
     * @throws ResourceNotFoundException if the Patient is not found.
     */
    @Transactional
    public DailyHealthLog addHealthLog(DailyHealthLog healthLog, String patientId) {
        // Validate the patient exists
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", patientId));

        // Link the log to the patient
        healthLog.setPatient(patient);

        return dailyHealthLogRepository.save(healthLog);
    }

    /**
     * Retrieves all DailyHealthLogs for a specific Patient.
     * Ordered by recordedAt descending (most recent first).
     *
     * @param patientId The Patient's ID.
     * @return A list of DailyHealthLog entries for the patient.
     * @throws ResourceNotFoundException if the Patient is not found.
     */
    public List<DailyHealthLog> getHealthLogsByPatientId(String patientId) {
        // Validate the patient exists
        patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", patientId));

        return dailyHealthLogRepository.findByPatientIdOrderByRecordedAtDesc(patientId);
    }

    /**
     * Retrieves a specific health log by its ID.
     *
     * @param logId The health log ID.
     * @return The DailyHealthLog entity.
     * @throws ResourceNotFoundException if the log is not found.
     */
    public DailyHealthLog getHealthLogById(String logId) {
        return dailyHealthLogRepository.findById(logId)
                .orElseThrow(() -> new ResourceNotFoundException("DailyHealthLog", "id", logId));
    }
}