package com.patientmonitoring.service;

import com.patientmonitoring.entity.AdviceFeedback;
import com.patientmonitoring.entity.DailyHealthLog;
import com.patientmonitoring.entity.Doctor;
import com.patientmonitoring.entity.Patient;
import com.patientmonitoring.exception.ResourceNotFoundException;
import com.patientmonitoring.repository.AdviceFeedbackRepository;
import com.patientmonitoring.repository.DailyHealthLogRepository;
import com.patientmonitoring.repository.DoctorRepository;
import com.patientmonitoring.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service class for AdviceFeedback-related business logic.
 * Handles creation, retrieval, and read-status management of
 * advice/feedback messages sent by Doctors to Patients.
 */
@Service
public class AdviceFeedbackService {

    private final AdviceFeedbackRepository adviceFeedbackRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final DailyHealthLogRepository dailyHealthLogRepository;

    public AdviceFeedbackService(AdviceFeedbackRepository adviceFeedbackRepository,
                                 DoctorRepository doctorRepository,
                                 PatientRepository patientRepository,
                                 DailyHealthLogRepository dailyHealthLogRepository) {
        this.adviceFeedbackRepository = adviceFeedbackRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.dailyHealthLogRepository = dailyHealthLogRepository;
    }

    /**
     * Creates a new AdviceFeedback message from a Doctor to a Patient.
     * Validates that both the Doctor and Patient exist.
     * Optionally links the feedback to a specific DailyHealthLog entry.
     *
     * @param adviceFeedback The feedback data (message content).
     * @param doctorId       The ID of the Doctor sending the feedback.
     * @param patientId      The ID of the Patient receiving the feedback.
     * @param relatedLogId   Optional: The ID of a related DailyHealthLog entry.
     * @return The saved AdviceFeedback entity.
     * @throws ResourceNotFoundException if Doctor, Patient, or DailyHealthLog is not found.
     */
    @Transactional
    public AdviceFeedback createAdviceFeedback(AdviceFeedback adviceFeedback,
                                               String doctorId,
                                               String patientId,
                                               String relatedLogId) {
        // Validate the doctor exists
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", doctorId));

        // Validate the patient exists
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", patientId));

        // Link the feedback to doctor and patient
        adviceFeedback.setDoctor(doctor);
        adviceFeedback.setPatient(patient);

        // If a related log ID is provided, validate and link it
        if (relatedLogId != null && !relatedLogId.isBlank()) {
            DailyHealthLog relatedLog = dailyHealthLogRepository.findById(relatedLogId)
                    .orElseThrow(() -> new ResourceNotFoundException("DailyHealthLog", "id", relatedLogId));

            // Ensure the related log belongs to the same patient
            if (!relatedLog.getPatient().getId().equals(patientId)) {
                throw new IllegalArgumentException(
                        "The related health log (ID: " + relatedLogId +
                                ") does not belong to Patient (ID: " + patientId + ")");
            }

            adviceFeedback.setRelatedLog(relatedLog);
        }

        // Default read status to false (unread)
        adviceFeedback.setRead(false);

        return adviceFeedbackRepository.save(adviceFeedback);
    }

    /**
     * Retrieves all AdviceFeedback messages for a specific Patient.
     * Ordered by sentAt descending (most recent first).
     *
     * @param patientId The Patient's ID.
     * @return A list of AdviceFeedback entries for the patient.
     * @throws ResourceNotFoundException if the Patient is not found.
     */
    public List<AdviceFeedback> getFeedbackByPatientId(String patientId) {
        // Validate the patient exists
        patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", patientId));

        return adviceFeedbackRepository.findByPatientIdOrderBySentAtDesc(patientId);
    }

    /**
     * Retrieves all AdviceFeedback messages sent by a specific Doctor.
     * Ordered by sentAt descending (most recent first).
     *
     * @param doctorId The Doctor's ID.
     * @return A list of AdviceFeedback entries sent by the doctor.
     * @throws ResourceNotFoundException if the Doctor is not found.
     */
    public List<AdviceFeedback> getFeedbackByDoctorId(String doctorId) {
        // Validate the doctor exists
        doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", doctorId));

        return adviceFeedbackRepository.findByDoctorIdOrderBySentAtDesc(doctorId);
    }

    /**
     * Retrieves all unread AdviceFeedback messages for a specific Patient.
     *
     * @param patientId The Patient's ID.
     * @return A list of unread AdviceFeedback entries.
     * @throws ResourceNotFoundException if the Patient is not found.
     */
    public List<AdviceFeedback> getUnreadFeedbackByPatientId(String patientId) {
        // Validate the patient exists
        patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", patientId));

        return adviceFeedbackRepository.findByPatientIdAndIsReadFalse(patientId);
    }

    /**
     * Retrieves a specific AdviceFeedback by its ID.
     *
     * @param feedbackId The feedback ID.
     * @return The AdviceFeedback entity.
     * @throws ResourceNotFoundException if the feedback is not found.
     */
    public AdviceFeedback getFeedbackById(String feedbackId) {
        return adviceFeedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new ResourceNotFoundException("AdviceFeedback", "id", feedbackId));
    }

    /**
     * Marks a specific AdviceFeedback message as read.
     *
     * @param feedbackId The ID of the feedback to mark as read.
     * @return The updated AdviceFeedback entity.
     * @throws ResourceNotFoundException if the feedback is not found.
     */
    @Transactional
    public AdviceFeedback markAsRead(String feedbackId) {
        AdviceFeedback feedback = adviceFeedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new ResourceNotFoundException("AdviceFeedback", "id", feedbackId));

        feedback.setRead(true);
        return adviceFeedbackRepository.save(feedback);
    }

    /**
     * Marks all unread AdviceFeedback messages for a Patient as read.
     * Useful for a "Mark All as Read" feature.
     *
     * @param patientId The Patient's ID.
     * @return The count of messages marked as read.
     * @throws ResourceNotFoundException if the Patient is not found.
     */
    @Transactional
    public int markAllAsReadForPatient(String patientId) {
        // Validate the patient exists
        patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", patientId));

        List<AdviceFeedback> unreadFeedbacks =
                adviceFeedbackRepository.findByPatientIdAndIsReadFalse(patientId);

        for (AdviceFeedback feedback : unreadFeedbacks) {
            feedback.setRead(true);
        }

        adviceFeedbackRepository.saveAll(unreadFeedbacks);
        return unreadFeedbacks.size();
    }
}