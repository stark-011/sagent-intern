package com.patientmonitoring.repository;

import com.patientmonitoring.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, String> {

    /**
     * Find a Patient by their full name.
     */
    Optional<Patient> findByFullName(String fullName);

    /**
     * Find a Patient by their contact details (email/phone).
     * Essential for Login and Duplicate checks.
     */
    Optional<Patient> findByContactDetails(String contactDetails);

    /**
     * Find all Patients assigned to a specific primary Doctor.
     */
    List<Patient> findByPrimaryDoctorId(String doctorId);
}