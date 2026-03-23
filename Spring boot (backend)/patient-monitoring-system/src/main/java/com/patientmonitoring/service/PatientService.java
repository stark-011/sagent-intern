package com.patientmonitoring.service;

import com.patientmonitoring.entity.Doctor;
import com.patientmonitoring.entity.Patient;
import com.patientmonitoring.exception.ResourceNotFoundException;
import com.patientmonitoring.repository.DoctorRepository;
import com.patientmonitoring.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public PatientService(PatientRepository patientRepository, DoctorRepository doctorRepository) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    /**
     * Registers a new Patient.
     * Checks for duplicates and optionally links a primary doctor.
     */
    @Transactional
    public Patient registerPatient(Patient patient, String primaryDoctorId) {
        // 1. Check for duplicates
        Optional<Patient> existingPatient = patientRepository.findByContactDetails(patient.getContactDetails());
        if (existingPatient.isPresent()) {
            throw new IllegalArgumentException("Patient with these contact details already exists.");
        }

        // 2. Link Primary Doctor if ID provided
        if (primaryDoctorId != null && !primaryDoctorId.isBlank()) {
            Doctor doctor = doctorRepository.findById(primaryDoctorId)
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", primaryDoctorId));
            patient.setPrimaryDoctor(doctor);
        }

        return patientRepository.save(patient);
    }

    public Patient getPatientById(String id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));
    }

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public List<Patient> getPatientsByDoctorId(String doctorId) {
        // Verify doctor exists first
        if (!doctorRepository.existsById(doctorId)) {
            throw new ResourceNotFoundException("Doctor", "id", doctorId);
        }
        return patientRepository.findByPrimaryDoctorId(doctorId);
    }
}