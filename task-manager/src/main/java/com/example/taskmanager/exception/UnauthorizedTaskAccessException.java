package com.example.taskmanager.exception;

public class UnauthorizedTaskAccessException extends RuntimeException {
  public UnauthorizedTaskAccessException(Long id) {
    super("Access denied for task: " + id);
  }
}
