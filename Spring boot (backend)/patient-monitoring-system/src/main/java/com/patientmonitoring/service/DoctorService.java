package com.patientmonitoring.service;

import com.patientmonitoring.entity.Doctor;
import com.patientmonitoring.exception.ResourceNotFoundException;
import com.patientmonitoring.repository.DoctorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    /**
     * Registers a new Doctor.
     * Throws exception if contact details (email/phone) already exist.
     */
    @Transactional
    public Doctor registerDoctor(Doctor doctor) {
        // 1. Check if doctor already exists with these details
        Optional<Doctor> existingDoctor = doctorRepository.findByContactDetails(doctor.getContactDetails());
        if (existingDoctor.isPresent()) {
            throw new IllegalArgumentException("Doctor with these contact details already exists.");
        }

        // 2. Save the doctor
        // In a real app, you would hash the password here:
        // doctor.setPassword(passwordEncoder.encode(doctor.getPassword()));
        return doctorRepository.save(doctor);
    }

    public Doctor getDoctorById(String id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id));
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }
}