package com.college.admission.service;

import com.college.admission.model.DesiredCourse;
import com.college.admission.repository.DesiredCourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class DesiredCourseService {

    @Autowired
    private DesiredCourseRepository repo;

    // CREATE & UPDATE
    public DesiredCourse addCourse(DesiredCourse course) {
        return repo.save(course);
    }

    // READ (Get All)
    public List<DesiredCourse> getAllCourses() {
        return repo.findAll();
    }

    // READ (Get One)
    public DesiredCourse getCourseById(Long id) {
        return repo.findById(id).orElse(null);
    }

    // DELETE
    public void deleteCourse(Long id) {
        repo.deleteById(id);
    }
}