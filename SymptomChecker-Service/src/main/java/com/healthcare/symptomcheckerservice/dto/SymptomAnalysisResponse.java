package com.healthcare.symptomcheckerservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class SymptomAnalysisResponse {

    private List<String> possibleConditions;
    private String recommendedSpecialty;
    private String urgency;
    private String advice;
    private String disclaimer;
}
