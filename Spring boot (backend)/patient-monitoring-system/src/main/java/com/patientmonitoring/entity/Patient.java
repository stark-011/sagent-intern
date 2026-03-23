package com.patientmonitoring.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty; // Import this!
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "patients")
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private String id;

    @NotBlank(message = "Full name is required")
    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Min(value = 0, message = "Age must be a positive number")
    @Column(name = "age")
    private int age;

    @Column(name = "contact_details")
    private String contactDetails;

    // FIX: Changed @JsonIgnore to @JsonProperty(access = WRITE_ONLY)
    @NotBlank(message = "Password is required")
    @Column(name = "password", nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "primary_doctor_id", referencedColumnName = "id")
    @JsonIgnoreProperties({"patients", "appointments", "adviceFeedbacks"})
    private Doctor primaryDoctor;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<DailyHealthLog> dailyHealthLogs = new ArrayList<>();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<PastRecord> pastRecords = new ArrayList<>();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Appointment> appointments = new ArrayList<>();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<AdviceFeedback> adviceFeedbacks = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Patient() {
    }

    public Patient(String fullName, int age, String contactDetails, String password) {
        this.fullName = fullName;
        this.age = age;
        this.contactDetails = contactDetails;
        this.password = password;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }

    public String getContactDetails() { return contactDetails; }
    public void setContactDetails(String contactDetails) { this.contactDetails = contactDetails; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Doctor getPrimaryDoctor() { return primaryDoctor; }
    public void setPrimaryDoctor(Doctor primaryDoctor) { this.primaryDoctor = primaryDoctor; }

    public List<DailyHealthLog> getDailyHealthLogs() { return dailyHealthLogs; }
    public void setDailyHealthLogs(List<DailyHealthLog> dailyHealthLogs) { this.dailyHealthLogs = dailyHealthLogs; }

    public List<PastRecord> getPastRecords() { return pastRecords; }
    public void setPastRecords(List<PastRecord> pastRecords) { this.pastRecords = pastRecords; }

    public List<Appointment> getAppointments() { return appointments; }
    public void setAppointments(List<Appointment> appointments) { this.appointments = appointments; }

    public List<AdviceFeedback> getAdviceFeedbacks() { return adviceFeedbacks; }
    public void setAdviceFeedbacks(List<AdviceFeedback> adviceFeedbacks) { this.adviceFeedbacks = adviceFeedbacks; }

    @Override
    public String toString() {
        return "Patient{" +
                "id='" + id + '\'' +
                ", fullName='" + fullName + '\'' +
                ", age=" + age +
                ", contactDetails='" + contactDetails + '\'' +
                ", createdAt=" + createdAt +
                ", primaryDoctorId=" + (primaryDoctor != null ? primaryDoctor.getId() : "null") +
                '}';
    }
}