package com.hospital.scheduling.core.domain.entity;

/**
 * Public because the use-case package reads it through the Lombok-generated
 * getter. As a package-private type nested in the entity file it was unreachable
 * from outside this package, which is why the status-handling lines in the use
 * case were commented out.
 */
public enum AppointmentStatus {
    SCHEDULED, CANCELLED, COMPLETED, NO_SHOW, RESCHEDULED
}
