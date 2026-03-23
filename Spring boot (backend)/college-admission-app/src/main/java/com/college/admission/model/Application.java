package com.college.admission.model;

import jakarta.persistence.*;
import jdk.jfr.DataAmount;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long appId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "course_id")

    private DesiredCourse course;

    // Applicant name entered in application form. Kept separate from account profile name.
    private String name;
    private LocalDate dob;
    private String address;
    private Double percentage;
    private String status; // 'Submitted', 'Under Review'
    private LocalDateTime submittedDate;

    // Getters and Setters
    public Long getAppId() { return appId; }
    public void setAppId(Long appId) { this.appId = appId; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public DesiredCourse getCourse() { return course; }
    public void setCourse(DesiredCourse course) { this.course = course; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public LocalDate getDob() { return dob; }
    public void setDob(LocalDate dob) { this.dob = dob; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getSubmittedDate() { return submittedDate; }
    public void setSubmittedDate(LocalDateTime submittedDate) { this.submittedDate = submittedDate; }
}
