package com.example.taskmanager.controller;

import com.example.taskmanager.api.dto.*;
import com.example.taskmanager.domain.Task;
import com.example.taskmanager.mapper.TaskMapper;
import com.example.taskmanager.service.TaskService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tasks")
public class TaskController {

  private final TaskService svc;

  public TaskController(TaskService svc) {
    this.svc = svc;
  }

  @PostMapping
  public ResponseEntity<TaskResponse> create(
    @RequestBody @Valid TaskRequest req,
    HttpServletRequest r) {

    String ownerId = (String) r.getAttribute("ownerId");
    Task t = TaskMapper.toEntity(req, ownerId);
    Task saved = svc.create(t);
    return ResponseEntity.status(HttpStatus.CREATED)
                         .body(TaskMapper.toResponse(saved));
  }

  // Bonus for pagination
  @GetMapping
  public Page<TaskResponse> list(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size,
    HttpServletRequest r) {

    String ownerId = (String) r.getAttribute("ownerId");
    return svc.list(ownerId, PageRequest.of(page, size))
              .map(TaskMapper::toResponse);
  }

  @GetMapping("/{id}")
  public TaskResponse get(
    @PathVariable Long id,
    HttpServletRequest r) {

    String ownerId = (String) r.getAttribute("ownerId");
    return TaskMapper.toResponse(svc.get(id, ownerId));
  }

  @PutMapping("/{id}")
  public TaskResponse update(
    @PathVariable Long id,
    @RequestBody @Valid TaskRequest req,
    HttpServletRequest r) {

    String ownerId = (String) r.getAttribute("ownerId");
    Task updated = TaskMapper.toEntity(req, ownerId);
    return TaskMapper.toResponse(svc.update(id, updated, ownerId));
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(
    @PathVariable Long id,
    HttpServletRequest r) {

    String ownerId = (String) r.getAttribute("ownerId");
    svc.delete(id, ownerId);
  }
}
