package com.example.taskmanager.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.example.taskmanager.domain.Task;
import com.example.taskmanager.exception.TaskNotFoundException;
import com.example.taskmanager.exception.UnauthorizedTaskAccessException;
import com.example.taskmanager.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.*;

import java.time.LocalDate;
import java.util.*;

class TaskServiceTest {

    @Mock
    private TaskRepository repo;

    @InjectMocks
    private TaskService service;

    private final String OWNER_ID = "user-123";
    private Task sample;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        sample = new Task();
        sample.setId(1L);
        sample.setTitle("Sample");
        sample.setDescription("Desc");
        sample.setStatus(null);
        sample.setDueDate(LocalDate.of(2025, 6, 1));
        sample.setOwnerId(OWNER_ID);
    }

    @Test
    void create_ShouldSaveAndReturnTask() {
        when(repo.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        Task toCreate = new Task();
        toCreate.setTitle("New");
        toCreate.setOwnerId(OWNER_ID);

        Task result = service.create(toCreate);

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("New");
        verify(repo).save(toCreate);
    }

    @Test
    void list_ShouldReturnPagedTasks() {
        Page<Task> page = new PageImpl<>(List.of(sample));
        Pageable pg = PageRequest.of(0, 10);
        when(repo.findAllByOwnerId(OWNER_ID, pg)).thenReturn(page);

        Page<Task> result = service.list(OWNER_ID, pg);

        assertThat(result.getContent()).hasSize(1).contains(sample);
    }

    @Test
    void get_NonExistingId_ShouldThrowNotFound() {
        when(repo.findById(2L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.get(2L, OWNER_ID))
            .isInstanceOf(TaskNotFoundException.class);
    }

    @Test
    void get_OwnedByDifferentUser_ShouldThrowUnauthorized() {
        Task other = new Task();
        other.setId(3L);
        other.setOwnerId("other");
        when(repo.findById(3L)).thenReturn(Optional.of(other));

        assertThatThrownBy(() -> service.get(3L, OWNER_ID))
            .isInstanceOf(UnauthorizedTaskAccessException.class);
    }

    @Test
    void get_ValidIdAndOwner_ShouldReturnCopy() {
        when(repo.findById(1L)).thenReturn(Optional.of(sample));

        Task copy = service.get(1L, OWNER_ID);

        assertThat(copy).isNotSameAs(sample);
        assertThat(copy.getId()).isEqualTo(sample.getId());
    }

    @Test
    void update_ShouldModifyAndSave() {
        Task updated = new Task();
        updated.setTitle("Updated");
        updated.setDescription("NewDesc");
        updated.setStatus(sample.getStatus());
        updated.setDueDate(sample.getDueDate());

        when(repo.findById(1L)).thenReturn(Optional.of(sample));
        when(repo.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        Task result = service.update(1L, updated, OWNER_ID);

        assertThat(result.getTitle()).isEqualTo("Updated");
        verify(repo).save(any(Task.class));
    }

    @Test
    void delete_ShouldRemoveTask() {
        when(repo.findById(1L)).thenReturn(Optional.of(sample));

        service.delete(1L, OWNER_ID);

        verify(repo).delete(sample);
    }
}