package com.example.taskmanager.api.dto;

import java.time.Instant;

public record ErrorDto(
  Instant timestamp,
  int status,
  String error,
  String message,
  String path
) {
  public static ErrorDto of(int status, String error, String msg, String path) {
    return new ErrorDto(Instant.now(), status, error, msg, path);
  }
}