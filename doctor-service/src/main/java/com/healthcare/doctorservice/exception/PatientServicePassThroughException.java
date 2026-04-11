package com.healthcare.doctorservice.exception;

import org.springframework.http.HttpStatusCode;

public class PatientServicePassThroughException extends RuntimeException {

    private final HttpStatusCode statusCode;

    public PatientServicePassThroughException(HttpStatusCode statusCode, String message) {
        super(message);
        this.statusCode = statusCode;
    }

    public HttpStatusCode getStatusCode() {
        return statusCode;
    }
}
