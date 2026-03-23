package com.patientmonitoring.repository;

import com.patientmonitoring.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, String> {
    List<Appointment> findByPatientIdOrderByScheduleTimeDesc(String patientId);
    List<Appointment> findByDoctorIdOrderByScheduleTimeDesc(String doctorId);
    List<Appointment> findByStatus(String status);
}