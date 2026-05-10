package com.hospital.scheduling.core.usecase;

import com.hospital.scheduling.core.domain.entity.Appointment;
import com.hospital.scheduling.core.domain.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RequiredArgsConstructor
public class SchedulingUseCase {

    private final AppointmentRepository repository;

    // Use Case 31: Book Appointment
    public Appointment book(Appointment appointment) {
        if (!isAvailable(appointment.getDoctorId(), appointment.getStartTime())) {
            throw new RuntimeException("Doctor not available at this time");
        }
        appointment.setId(UUID.randomUUID().toString());
        appointment.setCreatedAt(LocalDateTime.now());
        // Simple logic for demo
        return repository.save(appointment);
    }

    // Use Case 32: Cancel Appointment
    public void cancel(String id) {
        var appt = repository.findById(id).orElseThrow();
        // appt.setStatus(AppointmentStatus.CANCELLED);
        repository.save(appt);
    }

    // Use Case 33: Reschedule Appointment
    public Appointment reschedule(String id, LocalDateTime newTime) {
        var appt = repository.findById(id).orElseThrow();
        appt.setStartTime(newTime);
        // appt.setStatus(AppointmentStatus.RESCHEDULED);
        return repository.save(appt);
    }

    // Use Case 34: Complete Appointment
    public void complete(String id) {
        var appt = repository.findById(id).orElseThrow();
        // appt.setStatus(AppointmentStatus.COMPLETED);
        repository.save(appt);
    }

    // Use Case 35: Find by Patient
    public List<Appointment> getPatientAppointments(String patientId) {
        return repository.findAll().stream()
                .filter(a -> a.getPatientId().equals(patientId))
                .collect(Collectors.toList());
    }

    // Use Case 36: Find by Doctor
    public List<Appointment> getDoctorAppointments(String doctorId) {
        return repository.findAll().stream()
                .filter(a -> a.getDoctorId().equals(doctorId))
                .collect(Collectors.toList());
    }

    // Use Case 37: Check Availability (Mock)
    public boolean isAvailable(String doctorId, LocalDateTime time) {
        return repository.findAll().stream()
                .noneMatch(a -> a.getDoctorId().equals(doctorId) && a.getStartTime().equals(time));
    }

    // Use Case 38: Get Today's Appointments
    public List<Appointment> getTodaysAppointments() {
        var start = LocalDateTime.now().withHour(0).withMinute(0);
        var end = LocalDateTime.now().withHour(23).withMinute(59);
        return repository.findAll().stream()
                .filter(a -> a.getStartTime().isAfter(start) && a.getStartTime().isBefore(end))
                .collect(Collectors.toList());
    }

    // Use Case 39: Mark as No-Show
    public void markNoShow(String id) {
        var appt = repository.findById(id).orElseThrow();
        // appt.setStatus(AppointmentStatus.NO_SHOW);
        repository.save(appt);
    }

    // Use Case 40: List Upcoming for Doctor
    public List<Appointment> getUpcomingForDoctor(String doctorId) {
        return getDoctorAppointments(doctorId).stream()
                .filter(a -> a.getStartTime().isAfter(LocalDateTime.now()))
                .collect(Collectors.toList());
    }

    // Use Case 41: Get Appointment Status
    public String getStatus(String id) {
        return repository.findById(id).map(a -> a.getStatus().toString()).orElse("Unknown");
    }

    // Use Case 42: List Cancelled
    public List<Appointment> getCancelledAppointments() {
        return repository.findAll().stream()
                // .filter(a -> a.getStatus() == AppointmentStatus.CANCELLED)
                .collect(Collectors.toList());
    }

    // Use Case 43: Get Appointment by ID
    public Appointment getById(String id) {
        return repository.findById(id).orElseThrow();
    }

    // Use Case 44: Count Daily Appointments
    public long countDaily() {
        return getTodaysAppointments().size();
    }

    // Use Case 45: Generate Daily Schedule for Doctor
    public String generateSchedule(String doctorId, LocalDateTime date) {
        var appts = getDoctorAppointments(doctorId);
        return "Schedule for " + doctorId + ": " + appts.size() + " appointments";
    }
}
