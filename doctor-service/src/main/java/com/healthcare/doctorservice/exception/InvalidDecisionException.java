package com.healthcare.doctorservice.exception;

public class InvalidDecisionException extends RuntimeException {

    public InvalidDecisionException(String message) {
        super(message);
    }
}