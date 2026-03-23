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

import java.time.LocalDateTime;

/**
 * Entity representing a daily health log entry recorded by a Patient.
 * Each log belongs to one Patient (Many-to-One).
 * Contains vital signs: heart rate, blood pressure, oxygen level, temperature.
 */
@Entity
@Table(name = "daily_health_logs")
public class DailyHealthLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private String id;

    @Column(name = "heart_rate")
    private int heartRate;

    @Column(name = "blood_pressure")
    private String bloodPressure;

    @Column(name = "oxygen_level")
    private int oxygenLevel;

    @Column(name = "temperature")
    private float temperature;

    @Column(name = "recorded_at", updatable = false)
    private LocalDateTime recordedAt;

    /**
     * Many DailyHealthLogs belong to one Patient.
     * FK: daily_health_logs.patient_id -> patients.id
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", referencedColumnName = "id", nullable = false)
    @JsonIgnoreProperties({"dailyHealthLogs", "pastRecords", "appointments", "adviceFeedbacks", "password"})
    private Patient patient;

    /**
     * Automatically sets the recordedAt timestamp before persisting.
     */
    @PrePersist
    protected void onCreate() {
        this.recordedAt = LocalDateTime.now();
    }

    // ===================================================================
    // Constructors
    // ===================================================================

    public DailyHealthLog() {
    }

    public DailyHealthLog(int heartRate, String bloodPressure, int oxygenLevel, float temperature, Patient patient) {
        this.heartRate = heartRate;
        this.bloodPressure = bloodPressure;
        this.oxygenLevel = oxygenLevel;
        this.temperature = temperature;
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

    public int getHeartRate() {
        return heartRate;
    }

    public void setHeartRate(int heartRate) {
        this.heartRate = heartRate;
    }

    public String getBloodPressure() {
        return bloodPressure;
    }

    public void setBloodPressure(String bloodPressure) {
        this.bloodPressure = bloodPressure;
    }

    public int getOxygenLevel() {
        return oxygenLevel;
    }

    public void setOxygenLevel(int oxygenLevel) {
        this.oxygenLevel = oxygenLevel;
    }

    public float getTemperature() {
        return temperature;
    }

    public void setTemperature(float temperature) {
        this.temperature = temperature;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
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
        return "DailyHealthLog{" +
                "id='" + id + '\'' +
                ", heartRate=" + heartRate +
                ", bloodPressure='" + bloodPressure + '\'' +
                ", oxygenLevel=" + oxygenLevel +
                ", temperature=" + temperature +
                ", recordedAt=" + recordedAt +
                ", patientId=" + (patient != null ? patient.getId() : "null") +
                '}';
    }
}