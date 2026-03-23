package com.patientmonitoring.service;

import com.patientmonitoring.dto.auth.AuthUserResponse;
import com.patientmonitoring.dto.auth.LoginRequest;
import com.patientmonitoring.dto.auth.LoginResponse;
import com.patientmonitoring.entity.Doctor;
import com.patientmonitoring.entity.Patient;
import com.patientmonitoring.exception.InvalidCredentialsException;
import com.patientmonitoring.repository.DoctorRepository;
import com.patientmonitoring.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    public AuthService(DoctorRepository doctorRepository, PatientRepository patientRepository) {
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
    }

    public LoginResponse login(LoginRequest request) {
        String normalizedRole = normalizeRole(request.getRole());
        String normalizedContact = normalizeContactDetails(request.getContactDetails());
        String rawPassword = request.getPassword();

        return switch (normalizedRole) {
            case "DOCTOR" -> authenticateDoctor(normalizedContact, rawPassword);
            case "PATIENT" -> authenticatePatient(normalizedContact, rawPassword);
            default -> throw new IllegalArgumentException("Role must be PATIENT or DOCTOR.");
        };
    }

    private LoginResponse authenticateDoctor(String contactDetails, String rawPassword) {
        Doctor doctor = findDoctorByContactDetails(contactDetails)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid credentials."));

        if (!doctor.getPassword().equals(rawPassword)) {
            throw new InvalidCredentialsException("Invalid credentials.");
        }

        AuthUserResponse user = new AuthUserResponse(
                doctor.getId(),
                doctor.getFullName(),
                doctor.getContactDetails(),
                "DOCTOR"
        );

        String token = generateToken(doctor.getId(), "DOCTOR");
        return new LoginResponse(token, user);
    }

    private LoginResponse authenticatePatient(String contactDetails, String rawPassword) {
        Patient patient = findPatientByContactDetails(contactDetails)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid credentials."));

        if (!patient.getPassword().equals(rawPassword)) {
            throw new InvalidCredentialsException("Invalid credentials.");
        }

        AuthUserResponse user = new AuthUserResponse(
                patient.getId(),
                patient.getFullName(),
                patient.getContactDetails(),
                "PATIENT"
        );

        String token = generateToken(patient.getId(), "PATIENT");
        return new LoginResponse(token, user);
    }

    private Optional<Doctor> findDoctorByContactDetails(String contactDetails) {
        Optional<Doctor> directMatch = doctorRepository.findByContactDetails(contactDetails);
        if (directMatch.isPresent()) {
            return directMatch;
        }

        return doctorRepository.findAll().stream()
                .filter(doctor -> normalizeContactDetails(doctor.getContactDetails()).equals(contactDetails))
                .findFirst();
    }

    private Optional<Patient> findPatientByContactDetails(String contactDetails) {
        Optional<Patient> directMatch = patientRepository.findByContactDetails(contactDetails);
        if (directMatch.isPresent()) {
            return directMatch;
        }

        return patientRepository.findAll().stream()
                .filter(patient -> normalizeContactDetails(patient.getContactDetails()).equals(contactDetails))
                .findFirst();
    }

    private String generateToken(String userId, String role) {
        String payload = userId + ":" + role + ":" + Instant.now().getEpochSecond() + ":" + UUID.randomUUID();
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(payload.getBytes(StandardCharsets.UTF_8));
    }

    private String normalizeRole(String role) {
        return role == null ? "" : role.trim().toUpperCase();
    }

    private String normalizeContactDetails(String contactDetails) {
        return contactDetails == null ? "" : contactDetails.trim().toLowerCase();
    }
}
