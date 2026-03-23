package com.college.admission.controller;

import com.college.admission.model.Application;
import com.college.admission.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin("*")
public class ApplicationController {

    @Autowired
    private ApplicationService service;

    // CREATE
    @PostMapping
    public Application submitApplication(@RequestBody Application app) {
        return service.submitApplication(app);
    }

    // READ (All)
    @GetMapping
    public List<Application> getAllApplications() {
        return service.getAllApplications();
    }

    // READ (One)
    @GetMapping("/{id}")
    public Application getApplicationById(@PathVariable Long id) {
        return service.getApplicationById(id);
    }

    // UPDATE (e.g., Officer changing status to 'Accepted')
    @PutMapping("/{id}")
    public Application updateApplication(@PathVariable Long id, @RequestBody Application appDetails) {
        Application app = service.getApplicationById(id);
        if (app != null) {
            app.setStatus(appDetails.getStatus());
            if (appDetails.getName() != null && !appDetails.getName().isBlank()) {
                app.setName(appDetails.getName().trim());
            }
            app.setPercentage(appDetails.getPercentage());
            app.setAddress(appDetails.getAddress());
            return service.submitApplication(app);
        }
        return null;
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String deleteApplication(@PathVariable Long id) {
        service.deleteApplication(id);
        return "Application deleted successfully";
    }
}
