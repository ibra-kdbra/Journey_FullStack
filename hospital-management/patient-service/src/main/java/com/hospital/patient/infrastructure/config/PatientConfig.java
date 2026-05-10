package com.hospital.patient.infrastructure.config;

import com.hospital.patient.core.domain.repository.PatientRepository;
import com.hospital.patient.core.usecase.PatientUseCase;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PatientConfig {

    @Bean
    public PatientUseCase patientUseCase(PatientRepository patientRepository) {
        return new PatientUseCase(patientRepository);
    }
}
