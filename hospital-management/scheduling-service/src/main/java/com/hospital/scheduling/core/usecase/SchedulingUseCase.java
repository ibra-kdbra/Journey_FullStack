package com.hospital.scheduling.core.usecase;

import com.hospital.scheduling.core.domain.entity.Appointment;
import com.hospital.scheduling.core.domain.entity.AppointmentStatus;
import com.hospital.scheduling.core.domain.exception.AppointmentNotFoundException;
import com.hospital.scheduling.core.domain.exception.InvalidAppointmentException;
import com.hospital.scheduling.core.domain.exception.SlotUnavailableException;
import com.hospital.scheduling.core.domain.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RequiredArgsConstructor
public class SchedulingUseCase {

    private final AppointmentRepository repository;

    private static final Duration DEFAULT_DURATION = Duration.ofMinutes(30);

    private Appointment load(String id) {
        return repository.findById(id).orElseThrow(() -> new AppointmentNotFoundException(id));
    }

    /** End of the appointment, falling back to a default slot length when none was given. */
    private static LocalDateTime endOf(LocalDateTime start, LocalDateTime end) {
        return end != null ? end : start.plus(DEFAULT_DURATION);
    }

    private static boolean isActive(Appointment a) {
        return a.getStatus() != AppointmentStatus.CANCELLED;
    }

    /** True when the doctor has no non-cancelled appointment overlapping [start, end), ignoring {@code excludeId}. */
    private boolean isFree(String doctorId, LocalDateTime start, LocalDateTime end, String excludeId) {
        return repository.findAll().stream()
                .filter(a -> a.getDoctorId().equals(doctorId))
                .filter(SchedulingUseCase::isActive)
                .filter(a -> excludeId == null || !excludeId.equals(a.getId()))
                .noneMatch(a -> a.getStartTime().isBefore(end) && start.isBefore(endOf(a.getStartTime(), a.getEndTime())));
    }

    private static void requireTransition(Appointment appt, String operation, AppointmentStatus... allowed) {
        for (var s : allowed) {
            if (appt.getStatus() == s) {
                return;
            }
        }
        throw new InvalidAppointmentException(
                "Cannot " + operation + " appointment " + appt.getId() + " in status " + appt.getStatus());
    }

    // Use Case 31: Book Appointment
    public Appointment book(Appointment appointment) {
        if (appointment.getDoctorId() == null || appointment.getPatientId() == null
                || appointment.getStartTime() == null) {
            throw new InvalidAppointmentException("doctorId, patientId and startTime are required");
        }
        var end = endOf(appointment.getStartTime(), appointment.getEndTime());
        if (!end.isAfter(appointment.getStartTime())) {
            throw new InvalidAppointmentException("endTime must be after startTime");
        }
        if (!isFree(appointment.getDoctorId(), appointment.getStartTime(), end, null)) {
            throw new SlotUnavailableException("Doctor not available at this time");
        }
        appointment.setId(UUID.randomUUID().toString());
        appointment.setCreatedAt(LocalDateTime.now());
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        return repository.save(appointment);
    }

    // Use Case 32: Cancel Appointment
    public void cancel(String id) {
        var appt = load(id);
        requireTransition(appt, "cancel", AppointmentStatus.SCHEDULED, AppointmentStatus.RESCHEDULED);
        appt.setStatus(AppointmentStatus.CANCELLED);
        repository.save(appt);
    }

    // Use Case 33: Reschedule Appointment
    public Appointment reschedule(String id, LocalDateTime newTime) {
        if (newTime == null) {
            throw new InvalidAppointmentException("newTime is required");
        }
        var appt = load(id);
        requireTransition(appt, "reschedule", AppointmentStatus.SCHEDULED, AppointmentStatus.RESCHEDULED);
        // Keep the original duration (or the default slot length) at the new start.
        var duration = appt.getEndTime() != null
                ? Duration.between(appt.getStartTime(), appt.getEndTime())
                : DEFAULT_DURATION;
        var newEnd = newTime.plus(duration);
        if (!isFree(appt.getDoctorId(), newTime, newEnd, appt.getId())) {
            throw new SlotUnavailableException("Doctor not available at this time");
        }
        appt.setStartTime(newTime);
        appt.setEndTime(newEnd);
        appt.setStatus(AppointmentStatus.RESCHEDULED);
        return repository.save(appt);
    }

    // Use Case 34: Complete Appointment
    public void complete(String id) {
        var appt = load(id);
        requireTransition(appt, "complete", AppointmentStatus.SCHEDULED, AppointmentStatus.RESCHEDULED);
        appt.setStatus(AppointmentStatus.COMPLETED);
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
        return isFree(doctorId, time, time.plus(DEFAULT_DURATION), null);
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
        var appt = load(id);
        requireTransition(appt, "mark no-show", AppointmentStatus.SCHEDULED, AppointmentStatus.RESCHEDULED);
        appt.setStatus(AppointmentStatus.NO_SHOW);
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
        return repository.findById(id).map(Appointment::getStatus).map(Enum::toString).orElse("Unknown");
    }

    // Use Case 42: List Cancelled
    public List<Appointment> getCancelledAppointments() {
        return repository.findAll().stream()
                .filter(a -> a.getStatus() == AppointmentStatus.CANCELLED)
                .collect(Collectors.toList());
    }

    // Use Case 43: Get Appointment by ID
    public Appointment getById(String id) {
        return load(id);
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
