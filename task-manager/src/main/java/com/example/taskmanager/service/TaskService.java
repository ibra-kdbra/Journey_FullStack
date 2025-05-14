package com.example.taskmanager.service;

import com.example.taskmanager.domain.Task;
import com.example.taskmanager.exception.*;
import com.example.taskmanager.repository.TaskRepository;

import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TaskService {

  private final TaskRepository repo;

  public TaskService(TaskRepository repo) {
    this.repo = repo;
  }

  public Task create(Task task) {
    return repo.save(task);
  }

  public Page<Task> list(String ownerId, Pageable pg) {
    return repo.findAllByOwnerId(ownerId, pg);
  }

  public Task get(Long id, String ownerId) { //this will be used in the both update, delete
    Task t = repo.findById(id)
      .orElseThrow(() -> new TaskNotFoundException(id));
    if (!t.getOwnerId().equals(ownerId)) {
      throw new UnauthorizedTaskAccessException(id);
    }
    return toDto(t);
  }

  @Transactional
  public Task update(Long id, Task updated, String ownerId) {
    //Used upper funcctional for refactoring step.
    Task t = get(id, ownerId);
    t.setTitle(updated.getTitle());
    t.setDescription(updated.getDescription());
    t.setStatus(updated.getStatus());
    t.setDueDate(updated.getDueDate());
    return toDto(repo.save(t));
  }

  public void delete(Long id, String ownerId) {
    //Used upper funcctional for refactoring step.
    Task t = get(id, ownerId);
    repo.delete(t);
  }

  private Task toDto(Task task) {
        Task dto = new Task();
        BeanUtils.copyProperties(task, dto);
        return dto;
    }
}
