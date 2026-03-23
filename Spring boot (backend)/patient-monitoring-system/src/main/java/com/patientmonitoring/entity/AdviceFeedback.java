package com.patientmonitoring.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

/**
 * Entity representing advice/feedback sent by a Doctor to a Patient.
 * Optionally linked to a specific DailyHealthLog entry via related_log_id.
 * Has many-to-one relationships with Doctor, Patient, and (optionally) DailyHealthLog.
 */
@Entity
@Table(name = "advice_feedback")
public class AdviceFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private String id;

    @NotBlank(message = "Message is required")
    @Column(name = "message", columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(name = "sent_at", updatable = false)
    private LocalDateTime sentAt;

    @Column(name = "is_read")
    private boolean isRead;

    /**
     * Many AdviceFeedback messages are sent by one Doctor.
     * FK: advice_feedback.doctor_id -> doctors.id
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctor_id", referencedColumnName = "id", nullable = false)
    @JsonIgnoreProperties({"patients", "appointments", "adviceFeedbacks", "password"})
    private Doctor doctor;

    /**
     * Many AdviceFeedback messages are received by one Patient.
     * FK: advice_feedback.patient_id -> patients.id
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", referencedColumnName = "id", nullable = false)
    @JsonIgnoreProperties({"dailyHealthLogs", "pastRecords", "appointments", "adviceFeedbacks", "password"})
    private Patient patient;

    /**
     * Optional: Links the feedback to a specific DailyHealthLog entry.
     * FK: advice_feedback.related_log_id -> daily_health_logs.id
     * This is nullable because feedback may not always reference a specific log.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "related_log_id", referencedColumnName = "id")
    @JsonIgnoreProperties({"patient"})
    private DailyHealthLog relatedLog;

    /**
     * Automatically sets the sentAt timestamp before persisting.
     */
    @PrePersist
    protected void onCreate() {
        this.sentAt = LocalDateTime.now();
    }

    // ===================================================================
    // Constructors
    // ===================================================================

    public AdviceFeedback() {
    }

    public AdviceFeedback(String message, Doctor doctor, Patient patient, DailyHealthLog relatedLog) {
        this.message = message;
        this.doctor = doctor;
        this.patient = patient;
        this.relatedLog = relatedLog;
        this.isRead = false;
    }

    // ===================================================================
    // Getters and Setters
    // ===================================================================

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public Doctor getDoctor() {
        return doctor;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public DailyHealthLog getRelatedLog() {
        return relatedLog;
    }

    public void setRelatedLog(DailyHealthLog relatedLog) {
        this.relatedLog = relatedLog;
    }

    // ===================================================================
    // toString
    // ===================================================================

    @Override
    public String toString() {
        return "AdviceFeedback{" +
                "id='" + id + '\'' +
                ", message='" + message + '\'' +
                ", sentAt=" + sentAt +
                ", isRead=" + isRead +
                ", doctorId=" + (doctor != null ? doctor.getId() : "null") +
                ", patientId=" + (patient != null ? patient.getId() : "null") +
                ", relatedLogId=" + (relatedLog != null ? relatedLog.getId() : "null") +
                '}';
    }
}