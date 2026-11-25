package com.hospital.scheduling.core.usecase;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.hospital.scheduling.core.domain.entity.Appointment;
import com.hospital.scheduling.core.domain.entity.AppointmentStatus;
import com.hospital.scheduling.core.domain.exception.AppointmentNotFoundException;
import com.hospital.scheduling.core.domain.exception.InvalidAppointmentException;
import com.hospital.scheduling.core.domain.exception.SlotUnavailableException;
import com.hospital.scheduling.core.domain.repository.AppointmentRepository;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class SchedulingUseCaseTest {

    private static final LocalDateTime T9 = LocalDateTime.of(2030, 1, 10, 9, 0);

    private InMemoryRepository repo;
    private SchedulingUseCase useCase;

    @BeforeEach
    void setUp() {
        repo = new InMemoryRepository();
        useCase = new SchedulingUseCase(repo);
    }

    private Appointment book(String doctor, LocalDateTime start, int minutes) {
        return useCase.book(Appointment.builder()
                .patientId("p1").doctorId(doctor)
                .startTime(start).endTime(start.plusMinutes(minutes)).build());
    }

    @Test
    void bookSetsScheduledStatusAndStatusNeverThrows() {
        var a = book("d1", T9, 30);
        assertEquals(AppointmentStatus.SCHEDULED, a.getStatus());
        assertEquals("SCHEDULED", useCase.getStatus(a.getId()));
        assertEquals("Unknown", useCase.getStatus("missing"));
    }

    @Test
    void getStatusHandlesLegacyNullStatus() {
        repo.save(Appointment.builder().id("legacy").doctorId("d1").patientId("p").startTime(T9).build());
        assertEquals("Unknown", useCase.getStatus("legacy"));
    }

    @Test
    void overlappingBookingsForSameDoctorAreRejected() {
        book("d1", T9, 60);
        assertThrows(SlotUnavailableException.class, () -> book("d1", T9.plusMinutes(30), 30)); // starts inside
        assertThrows(SlotUnavailableException.class, () -> book("d1", T9.minusMinutes(15), 30)); // ends inside
        assertThrows(SlotUnavailableException.class, () -> book("d1", T9.minusMinutes(30), 180)); // encloses
        assertThrows(SlotUnavailableException.class, () -> book("d1", T9, 60)); // exact
    }

    @Test
    void adjacentAndOtherDoctorBookingsAreAllowed() {
        book("d1", T9, 60);
        book("d1", T9.plusMinutes(60), 30);
        book("d1", T9.minusMinutes(30), 30);
        book("d2", T9, 60);
    }

    @Test
    void cancelledAppointmentFreesTheSlot() {
        var a = book("d1", T9, 60);
        useCase.cancel(a.getId());
        assertEquals(AppointmentStatus.CANCELLED, useCase.getById(a.getId()).getStatus());
        assertTrue(useCase.isAvailable("d1", T9));
        book("d1", T9, 60);
        assertEquals(1, useCase.getCancelledAppointments().size());
    }

    @Test
    void rescheduleChecksAvailabilityAndUpdatesStatus() {
        var a = book("d1", T9, 60);
        book("d1", T9.plusHours(3), 60);
        assertThrows(SlotUnavailableException.class, () -> useCase.reschedule(a.getId(), T9.plusHours(3).plusMinutes(30)));
        assertEquals(T9, useCase.getById(a.getId()).getStartTime());

        var moved = useCase.reschedule(a.getId(), T9.plusMinutes(30)); // overlaps only itself
        assertEquals(AppointmentStatus.RESCHEDULED, moved.getStatus());
        assertEquals(T9.plusMinutes(30), moved.getStartTime());
        assertEquals(T9.plusMinutes(90), moved.getEndTime());
    }

    @Test
    void completeAndNoShowTransitions() {
        var a = book("d1", T9, 30);
        var b = book("d1", T9.plusHours(1), 30);
        useCase.complete(a.getId());
        useCase.markNoShow(b.getId());
        assertEquals(AppointmentStatus.COMPLETED, useCase.getById(a.getId()).getStatus());
        assertEquals(AppointmentStatus.NO_SHOW, useCase.getById(b.getId()).getStatus());
        assertThrows(InvalidAppointmentException.class, () -> useCase.cancel(a.getId()));
        assertThrows(InvalidAppointmentException.class, () -> useCase.reschedule(b.getId(), T9.plusDays(1)));
    }

    @Test
    void unknownIdAndInvalidInput() {
        assertThrows(AppointmentNotFoundException.class, () -> useCase.cancel("nope"));
        assertThrows(InvalidAppointmentException.class, () -> book("d1", T9, -10));
        assertFalse(useCase.getCancelledAppointments().iterator().hasNext());
    }

    private static class InMemoryRepository implements AppointmentRepository {
        private final Map<String, Appointment> store = new LinkedHashMap<>();

        @Override public Appointment save(Appointment a) { store.put(a.getId(), a); return a; }
        @Override public Optional<Appointment> findById(String id) { return Optional.ofNullable(store.get(id)); }
        @Override public List<Appointment> findAll() { return List.copyOf(store.values()); }
        @Override public void deleteById(String id) { store.remove(id); }
    }
}
