package com.example.taskmanager.api;

import com.example.taskmanager.api.dto.ErrorDto;
import com.example.taskmanager.exception.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(TaskNotFoundException.class)
  @ResponseStatus(HttpStatus.NOT_FOUND)
  public ErrorDto onNotFound(TaskNotFoundException ex, HttpServletRequest req) {
    return ErrorDto.of(404, "Not Found", ex.getMessage(), req.getRequestURI());
  }

  @ExceptionHandler(UnauthorizedTaskAccessException.class)
  @ResponseStatus(HttpStatus.FORBIDDEN)
  public ErrorDto onForbidden(UnauthorizedTaskAccessException ex, HttpServletRequest req) {
    return ErrorDto.of(403, "Forbidden", ex.getMessage(), req.getRequestURI());
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public ErrorDto onValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
    String msg = ex.getBindingResult().getFieldErrors().stream()
      .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
      .reduce((a, b) -> a + ", " + b)
      .orElse(ex.getMessage());
    return ErrorDto.of(400, "Bad Request", msg, req.getRequestURI());
  }
}
