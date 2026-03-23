package com.college.admission.service;

import com.college.admission.model.Application;
import com.college.admission.repository.ApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository repo;

    // CREATE & UPDATE
    public Application submitApplication(Application app) {
        if (app.getSubmittedDate() == null) {
            app.setSubmittedDate(LocalDateTime.now());
        }
        if (app.getStatus() == null) {
            app.setStatus("Submitted");
        }
        return repo.save(app);
    }

    // READ (Get All)
    public List<Application> getAllApplications() {
        return repo.findAll();
    }

    // READ (Get One)
    public Application getApplicationById(Long id) {
        return repo.findById(id).orElse(null);
    }

    // DELETE
    public void deleteApplication(Long id) {
        repo.deleteById(id);
    }
}