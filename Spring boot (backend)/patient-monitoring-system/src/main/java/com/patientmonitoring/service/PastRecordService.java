package com.patientmonitoring.service;

import com.patientmonitoring.entity.PastRecord;
import com.patientmonitoring.entity.Patient;
import com.patientmonitoring.exception.ResourceNotFoundException;
import com.patientmonitoring.repository.PastRecordRepository;
import com.patientmonitoring.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service class for PastRecord-related business logic.
 * Handles creation, retrieval, update, and deletion of past medical records.
 */
@Service
public class PastRecordService {

    private final PastRecordRepository pastRecordRepository;
    private final PatientRepository patientRepository;

    public PastRecordService(PastRecordRepository pastRecordRepository,
                             PatientRepository patientRepository) {
        this.pastRecordRepository = pastRecordRepository;
        this.patientRepository = patientRepository;
    }

    /**
     * Creates a new PastRecord entry for a given Patient.
     * Validates that the patient exists before saving the record.
     *
     * @param pastRecord The past record data (record name, description, file URL, date).
     * @param patientId  The ID of the patient this record belongs to.
     * @return The saved PastRecord entity.
     * @throws ResourceNotFoundException if the Patient is not found.
     */
    @Transactional
    public PastRecord createPastRecord(PastRecord pastRecord, String patientId) {
        // Validate that the patient exists
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", patientId));

        // Link the record to the patient
        pastRecord.setPatient(patient);

        return pastRecordRepository.save(pastRecord);
    }

    /**
     * Retrieves all PastRecords for a specific Patient.
     *
     * @param patientId The Patient's ID.
     * @return A list of PastRecord entries for the patient.
     * @throws ResourceNotFoundException if the Patient is not found.
     */
    public List<PastRecord> getPastRecordsByPatientId(String patientId) {
        // Validate that the patient exists
        patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", patientId));

        return pastRecordRepository.findByPatientId(patientId);
    }

    /**
     * Retrieves a specific PastRecord by its ID.
     *
     * @param recordId The past record's ID.
     * @return The PastRecord entity.
     * @throws ResourceNotFoundException if the record is not found.
     */
    public PastRecord getPastRecordById(String recordId) {
        return pastRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("PastRecord", "id", recordId));
    }

    /**
     * Updates an existing PastRecord.
     * Only non-null fields in the incoming object will overwrite the existing values.
     *
     * @param recordId          The ID of the record to update.
     * @param updatedPastRecord The updated data.
     * @return The updated PastRecord entity.
     * @throws ResourceNotFoundException if the record is not found.
     */
    @Transactional
    public PastRecord updatePastRecord(String recordId, PastRecord updatedPastRecord) {
        // Fetch the existing record
        PastRecord existingRecord = pastRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("PastRecord", "id", recordId));

        // Update only non-null fields
        if (updatedPastRecord.getRecordName() != null && !updatedPastRecord.getRecordName().isBlank()) {
            existingRecord.setRecordName(updatedPastRecord.getRecordName());
        }
        if (updatedPastRecord.getDescription() != null) {
            existingRecord.setDescription(updatedPastRecord.getDescription());
        }
        if (updatedPastRecord.getFileUrl() != null) {
            existingRecord.setFileUrl(updatedPastRecord.getFileUrl());
        }
        if (updatedPastRecord.getRecordDate() != null) {
            existingRecord.setRecordDate(updatedPastRecord.getRecordDate());
        }

        return pastRecordRepository.save(existingRecord);
    }

    /**
     * Deletes a PastRecord by its ID.
     *
     * @param recordId The ID of the record to delete.
     * @throws ResourceNotFoundException if the record is not found.
     */
    @Transactional
    public void deletePastRecord(String recordId) {
        PastRecord existingRecord = pastRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("PastRecord", "id", recordId));

        pastRecordRepository.delete(existingRecord);
    }
}