package com.hospital.scheduling.core.domain.repository;

import com.hospital.scheduling.core.domain.entity.Appointment;
import java.util.List;
import java.util.Optional;

public interface AppointmentRepository {
    Appointment save(Appointment appointment);
    Optional<Appointment> findById(String id);
    List<Appointment> findAll();
    void deleteById(String id);
}
