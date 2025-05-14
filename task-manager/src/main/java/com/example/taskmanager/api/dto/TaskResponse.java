package com.example.taskmanager.api.dto;

import java.time.LocalDate;
import com.example.taskmanager.domain.Task.Status;

public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private Status status;
    private LocalDate dueDate;

    public TaskResponse(Long id, String title, String description, Status status, LocalDate dueDate) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
        this.dueDate = dueDate;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public Status getStatus() {
        return status;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }
}
