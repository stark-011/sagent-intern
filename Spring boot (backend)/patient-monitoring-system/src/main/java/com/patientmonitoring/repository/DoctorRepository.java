package com.patientmonitoring.repository;

import com.patientmonitoring.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, String> {

    /**
     * Find a Doctor by their full name.
     */
    Optional<Doctor> findByFullName(String fullName);

    /**
     * Find a Doctor by their contact details (email/phone).
     * Essential for Login and Duplicate checks.
     */
    Optional<Doctor> findByContactDetails(String contactDetails);
}