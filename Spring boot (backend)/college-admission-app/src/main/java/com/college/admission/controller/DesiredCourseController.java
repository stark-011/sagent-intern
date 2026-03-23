package com.college.admission.controller;

import com.college.admission.model.DesiredCourse;
import com.college.admission.service.DesiredCourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin("*")
public class DesiredCourseController {

    @Autowired
    private DesiredCourseService service;

    // CREATE
    @PostMapping
    public DesiredCourse addCourse(@RequestBody DesiredCourse course) {
        return service.addCourse(course);
    }

    // READ (All)
    @GetMapping
    public List<DesiredCourse> getAllCourses() {
        return service.getAllCourses();
    }

    // READ (One)
    @GetMapping("/{id}")
    public DesiredCourse getCourseById(@PathVariable Long id) {
        return service.getCourseById(id);
    }

    // UPDATE
    @PutMapping("/{id}")
    public DesiredCourse updateCourse(@PathVariable Long id, @RequestBody DesiredCourse courseDetails) {
        DesiredCourse course = service.getCourseById(id);
        if (course != null) {
            course.setCourseName(courseDetails.getCourseName());
            course.setDuration(courseDetails.getDuration());
            course.setCourseType(courseDetails.getCourseType());
            return service.addCourse(course);
        }
        return null;
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String deleteCourse(@PathVariable Long id) {
        service.deleteCourse(id);
        return "Course deleted successfully";
    }
}