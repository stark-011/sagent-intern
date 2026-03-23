package com.patientmonitoring.service;

import com.patientmonitoring.entity.Appointment;
import com.patientmonitoring.entity.Doctor;
import com.patientmonitoring.entity.Patient;
import com.patientmonitoring.exception.ResourceNotFoundException;
import com.patientmonitoring.repository.AppointmentRepository;
import com.patientmonitoring.repository.DoctorRepository;
import com.patientmonitoring.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service class for Appointment-related business logic.
 * Handles scheduling and retrieval of appointments.
 */
@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              DoctorRepository doctorRepository,
                              PatientRepository patientRepository) {
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
    }

    /**
     * Schedules a new Appointment between a Patient and a Doctor.
     * Validates that both the Patient and Doctor exist.
     * Sets the initial status to "SCHEDULED" if not provided.
     *
     * @param appointment The appointment data (schedule time, etc.).
     * @param doctorId    The ID of the doctor for the appointment.
     * @param patientId   The ID of the patient for the appointment.
     * @return The saved Appointment entity.
     * @throws ResourceNotFoundException if Doctor or Patient is not found.
     */
    @Transactional
    public Appointment scheduleAppointment(Appointment appointment, String doctorId, String patientId) {
        // Validate the doctor exists
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", doctorId));

        // Validate the patient exists
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", patientId));

        // Link the appointment to the doctor and patient
        appointment.setDoctor(doctor);
        appointment.setPatient(patient);

        // Set default status if none is provided
        if (appointment.getStatus() == null || appointment.getStatus().isBlank()) {
            appointment.setStatus("SCHEDULED");
        }

        return appointmentRepository.save(appointment);
    }

    /**
     * Retrieves all Appointments for a specific Patient.
     *
     * @param patientId The Patient's ID.
     * @return A list of Appointments for the patient.
     */
    public List<Appointment> getAppointmentsByPatientId(String patientId) {
        patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", patientId));
        return appointmentRepository.findByPatientIdOrderByScheduleTimeDesc(patientId);
    }

    /**
     * Retrieves all Appointments for a specific Doctor.
     *
     * @param doctorId The Doctor's ID.
     * @return A list of Appointments for the doctor.
     */
    public List<Appointment> getAppointmentsByDoctorId(String doctorId) {
        doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", doctorId));
        return appointmentRepository.findByDoctorIdOrderByScheduleTimeDesc(doctorId);
    }

    /**
     * Retrieves an Appointment by its ID.
     *
     * @param appointmentId The Appointment's ID.
     * @return The Appointment entity.
     * @throws ResourceNotFoundException if no Appointment is found.
     */
    public Appointment getAppointmentById(String appointmentId) {
        return appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));
    }
}