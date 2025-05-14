package com.example.taskmanager.api.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import com.example.taskmanager.domain.Task.Status;

public class TaskRequest {
    @NotBlank
    private String title;

    private String description;
    private Status status;
    private LocalDate dueDate;

    public TaskRequest() {
        //
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }
}