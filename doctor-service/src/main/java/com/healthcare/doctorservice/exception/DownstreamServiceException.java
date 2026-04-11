package com.healthcare.doctorservice.exception;

public class DownstreamServiceException extends RuntimeException {

    public DownstreamServiceException(String message) {
        super(message);
    }
}