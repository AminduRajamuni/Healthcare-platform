package com.healthcare.telemedicineservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<Map<String, String>> handleResourceNotFound(ResourceNotFoundException ex) {
    Map<String, String> response = new HashMap<>();
    response.put("message", ex.getMessage());
    return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
  }

  @ExceptionHandler(DuplicateSessionException.class)
  public ResponseEntity<Map<String, String>> handleDuplicateSession(DuplicateSessionException ex) {
    Map<String, String> response = new HashMap<>();
    response.put("message", ex.getMessage());
    return new ResponseEntity<>(response, HttpStatus.CONFLICT);
  }

  @ExceptionHandler(UnauthorizedSessionAccessException.class)
  public ResponseEntity<Map<String, String>> handleUnauthorizedSessionAccess(UnauthorizedSessionAccessException ex) {
    Map<String, String> response = new HashMap<>();
    response.put("message", ex.getMessage());
    return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
  }

  @ExceptionHandler(InvalidSessionStateException.class)
  public ResponseEntity<Map<String, String>> handleInvalidSessionState(InvalidSessionStateException ex) {
    Map<String, String> response = new HashMap<>();
    response.put("message", ex.getMessage());
    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
    Map<String, String> errors = new HashMap<>();
    for (FieldError error : ex.getBindingResult().getFieldErrors()) {
      errors.put(error.getField(), error.getDefaultMessage());
    }
    return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
  }
}

