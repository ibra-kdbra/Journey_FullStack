package com.hospital.patient.infrastructure.web.controller;

import com.hospital.patient.core.usecase.PatientUseCase;
import com.hospital.patient.infrastructure.web.dto.PatientRequestDTO;
import com.hospital.patient.infrastructure.web.dto.PatientResponseDTO;
import com.hospital.patient.infrastructure.web.mapper.PatientWebMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
@Tag(name = "Patient Management", description = "Operations for registering and managing patients")
public class PatientController {

    private final PatientUseCase patientUseCase;
    private final PatientWebMapper mapper;

    @PostMapping
    @Operation(summary = "Register a new patient", description = "Creates a new patient record with insurance and contact details")
    public ResponseEntity<PatientResponseDTO> register(@Valid @RequestBody PatientRequestDTO request) {
        var patient = mapper.toDomain(request);
        var registeredPatient = patientUseCase.registerPatient(patient);
        return new ResponseEntity<>(mapper.toResponseDTO(registeredPatient), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientResponseDTO> getById(@PathVariable String id) {
        var patient = patientUseCase.getPatientById(id);
        return ResponseEntity.ok(mapper.toResponseDTO(patient));
    }

    @GetMapping
    public ResponseEntity<List<PatientResponseDTO>> getAll() {
        var patients = patientUseCase.getAllPatients();
        var dtos = patients.stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
