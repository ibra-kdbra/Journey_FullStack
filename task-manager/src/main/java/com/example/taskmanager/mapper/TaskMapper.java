package com.example.taskmanager.mapper;

import com.example.taskmanager.api.dto.*;
import com.example.taskmanager.domain.Task;

public class TaskMapper {
  public static Task toEntity(TaskRequest r, String ownerId) {
    Task t = new Task();
    t.setTitle(r.getTitle());
    t.setDescription(r.getDescription());
    t.setStatus(r.getStatus());
    t.setDueDate(r.getDueDate());
    t.setOwnerId(ownerId);
    return t;
  }

  public static TaskResponse toResponse(Task t) {
    return new TaskResponse(
      t.getId(), t.getTitle(), t.getDescription(),
      t.getStatus(), t.getDueDate()
    );
  }
}
