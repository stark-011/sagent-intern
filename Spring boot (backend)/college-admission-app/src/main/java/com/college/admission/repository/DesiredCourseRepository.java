package com.college.admission.repository;
import com.college.admission.model.DesiredCourse;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DesiredCourseRepository extends JpaRepository<DesiredCourse, Long> {}