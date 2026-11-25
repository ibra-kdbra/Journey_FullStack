package com.hospital.scheduling.core.domain.exception;

/** Thrown when the doctor already has an active appointment overlapping the requested time. */
public class SlotUnavailableException extends RuntimeException {
    public SlotUnavailableException(String message) {
        super(message);
    }
}
