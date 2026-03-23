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
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

/**
 * Entity representing a past medical record uploaded by a Patient.
 * Each record belongs to one Patient (Many-to-One).
 */
@Entity
@Table(name = "past_records")
public class PastRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private String id;

    @NotBlank(message = "Record name is required")
    @Column(name = "record_name", nullable = false)
    private String recordName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "file_url")
    private String fileUrl;

    @Column(name = "record_date")
    private LocalDateTime recordDate;

    /**
     * Many PastRecords belong to one Patient.
     * FK: past_records.patient_id -> patients.id
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", referencedColumnName = "id", nullable = false)
    @JsonIgnoreProperties({"dailyHealthLogs", "pastRecords", "appointments", "adviceFeedbacks", "password"})
    private Patient patient;

    // ===================================================================
    // Constructors
    // ===================================================================

    public PastRecord() {
    }

    public PastRecord(String recordName, String description, String fileUrl, LocalDateTime recordDate, Patient patient) {
        this.recordName = recordName;
        this.description = description;
        this.fileUrl = fileUrl;
        this.recordDate = recordDate;
        this.patient = patient;
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

    public String getRecordName() {
        return recordName;
    }

    public void setRecordName(String recordName) {
        this.recordName = recordName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public LocalDateTime getRecordDate() {
        return recordDate;
    }

    public void setRecordDate(LocalDateTime recordDate) {
        this.recordDate = recordDate;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    // ===================================================================
    // toString
    // ===================================================================

    @Override
    public String toString() {
        return "PastRecord{" +
                "id='" + id + '\'' +
                ", recordName='" + recordName + '\'' +
                ", description='" + description + '\'' +
                ", fileUrl='" + fileUrl + '\'' +
                ", recordDate=" + recordDate +
                ", patientId=" + (patient != null ? patient.getId() : "null") +
                '}';
    }
}