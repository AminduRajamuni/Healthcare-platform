package com.healthcare.patientservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ServiceRedirectDto {

    private boolean success;
    private String serviceName;
    private String httpMethod;
    private String targetUrl;
    private String message;
}

