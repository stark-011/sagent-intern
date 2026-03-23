package com.college.admission.model;

import jakarta.persistence.*;

@Entity
public class DesiredCourse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long courseId;

    private String courseName; // e.g., "B.Tech CS"
    private String courseType; // e.g., "Full Time"
    private String duration;   // e.g., "4 Years"

    // Getters and Setters
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }
    public String getCourseType() { return courseType; }
    public void setCourseType(String courseType) { this.courseType = courseType; }
    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }
}