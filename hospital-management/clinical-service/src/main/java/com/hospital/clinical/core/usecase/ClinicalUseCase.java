package com.hospital.clinical.core.usecase;

import com.hospital.clinical.core.domain.entity.Doctor;
import com.hospital.clinical.core.domain.entity.MedicalRecord;
import com.hospital.clinical.core.domain.repository.DoctorRepository;
import com.hospital.clinical.core.domain.repository.MedicalRecordRepository;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RequiredArgsConstructor
public class ClinicalUseCase {

    private final DoctorRepository doctorRepository;
    private final MedicalRecordRepository recordRepository;

    // Use Case 16: Register new doctor
    public Doctor registerDoctor(Doctor doctor) {
        doctor.setId(UUID.randomUUID().toString());
        doctor.setAvailable(true);
        return doctorRepository.save(doctor);
    }

    // Use Case 17: Update doctor availability
    public void setAvailability(String doctorId, boolean status) {
        var doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        doctor.setAvailable(status);
        doctorRepository.save(doctor);
    }

    // Use Case 18: Add medical record
    public MedicalRecord addMedicalRecord(MedicalRecord record) {
        record.setId(UUID.randomUUID().toString());
        record.setRecordDate(LocalDateTime.now());
        return recordRepository.save(record);
    }

    // Use Case 19: Get full patient history
    public List<MedicalRecord> getPatientHistory(String patientId) {
        return recordRepository.findAllByPatientId(patientId);
    }

    // Use Case 20: Search doctors by specialization
    public List<Doctor> findSpecialists(String spec) {
        return doctorRepository.findAll().stream()
                .filter(d -> d.getSpecialization().equalsIgnoreCase(spec))
                .collect(Collectors.toList());
    }

    // Use Case 21: Assign doctor to department
    public void assignDepartment(String doctorId, String department) {
        var doctor = doctorRepository.findById(doctorId).orElseThrow();
        doctor.setDepartment(department);
        doctorRepository.save(doctor);
    }

    // Use Case 22: Get recent records (Last 30 days)
    public List<MedicalRecord> getRecentRecords() {
        return recordRepository.findAll().stream()
                .filter(r -> r.getRecordDate().isAfter(LocalDateTime.now().minusDays(30)))
                .collect(Collectors.toList());
    }

    // Use Case 23: Update diagnosis for an existing record
    public void updateDiagnosis(String recordId, String newDiagnosis) {
        var record = recordRepository.findById(recordId).orElseThrow();
        record.setDiagnosis(newDiagnosis);
        recordRepository.save(record);
    }

    // Use Case 24: List doctors by department
    public List<Doctor> getDepartmentDoctors(String dept) {
        return doctorRepository.findAll().stream()
                .filter(d -> d.getDepartment().equalsIgnoreCase(dept))
                .collect(Collectors.toList());
    }

    // Use Case 25: Find medical records by doctor
    public List<MedicalRecord> getRecordsByDoctor(String doctorId) {
        return recordRepository.findAll().stream()
                .filter(r -> r.getDoctorId().equals(doctorId))
                .collect(Collectors.toList());
    }

    // Use Case 26: Validate if doctor is specialized in a field
    public boolean isSpecialist(String doctorId, String spec) {
        return doctorRepository.findById(doctorId)
                .map(d -> d.getSpecialization().equalsIgnoreCase(spec))
                .orElse(false);
    }

    // Use Case 27: Get count of records per patient
    public long countRecordsForPatient(String patientId) {
        return recordRepository.findAllByPatientId(patientId).size();
    }

    // Use Case 28: List all available doctors
    public List<Doctor> getAvailableDoctors() {
        return doctorRepository.findAll().stream()
                .filter(Doctor::isAvailable)
                .collect(Collectors.toList());
    }

    // Use Case 29: Bulk update doctor availability
    public void bulkAvailabilityUpdate(List<String> ids, boolean status) {
        ids.forEach(id -> setAvailability(id, status));
    }

    // Use Case 30: Get most frequent diagnosis for a patient
    public String getPrimaryDiagnosis(String patientId) {
        var records = recordRepository.findAllByPatientId(patientId);
        if (records.isEmpty()) return "None";
        return records.get(0).getDiagnosis(); // Simple logic for demo
    }
}
