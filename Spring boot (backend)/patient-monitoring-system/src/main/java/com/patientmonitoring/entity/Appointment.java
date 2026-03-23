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
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

/**
 * Entity representing an Appointment between a Patient and a Doctor.
 * An Appointment has a many-to-one relationship with both Patient and Doctor.
 */
@Entity
@Table(name = "appointments")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private String id;

    @NotNull(message = "Schedule time is required")
    @Column(name = "schedule_time", nullable = false)
    private LocalDateTime scheduleTime;

    @Column(name = "status")
    private String status;

    /**
     * Many Appointments belong to one Doctor.
     * FK: appointments.doctor_id -> doctors.id
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctor_id", referencedColumnName = "id", nullable = false)
    @JsonIgnoreProperties({"patients", "appointments", "adviceFeedbacks", "password"})
    private Doctor doctor;

    /**
     * Many Appointments belong to one Patient.
     * FK: appointments.patient_id -> patients.id
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", referencedColumnName = "id", nullable = false)
    @JsonIgnoreProperties({"dailyHealthLogs", "pastRecords", "appointments", "adviceFeedbacks", "password"})
    private Patient patient;

    // ===================================================================
    // Constructors
    // ===================================================================

    public Appointment() {
    }

    public Appointment(LocalDateTime scheduleTime, String status, Doctor doctor, Patient patient) {
        this.scheduleTime = scheduleTime;
        this.status = status;
        this.doctor = doctor;
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

    public LocalDateTime getScheduleTime() {
        return scheduleTime;
    }

    public void setScheduleTime(LocalDateTime scheduleTime) {
        this.scheduleTime = scheduleTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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

    // ===================================================================
    // toString
    // ===================================================================

    @Override
    public String toString() {
        return "Appointment{" +
                "id='" + id + '\'' +
                ", scheduleTime=" + scheduleTime +
                ", status='" + status + '\'' +
                ", doctorId=" + (doctor != null ? doctor.getId() : "null") +
                ", patientId=" + (patient != null ? patient.getId() : "null") +
                '}';
    }
}