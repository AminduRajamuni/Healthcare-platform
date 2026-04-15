package com.healthcare.symptomcheckerservice.controller;

import com.healthcare.symptomcheckerservice.dto.SymptomAnalysisResponse;
import com.healthcare.symptomcheckerservice.dto.SymptomRequest;
import com.healthcare.symptomcheckerservice.service.SymptomAnalyzerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/symptoms")
@RequiredArgsConstructor
public class SymptomCheckerController {

    private final SymptomAnalyzerService symptomAnalyzerService;

    /**
     * POST /api/symptoms/analyze
     *
     * Accepts a patient's symptoms description and returns AI-generated
     * preliminary health suggestions, recommended specialty, urgency level,
     * and a safety disclaimer.
     *
     * Request:
     *   { "symptoms": "fever, cough, sore throat for 2 days" }
     *
     * Response:
     *   {
     *     "possibleConditions": ["Viral upper respiratory infection", "Flu"],
     *     "recommendedSpecialty": "General Physician",
     *     "urgency": "LOW",
     *     "advice": "Rest, hydration, and consult a doctor if symptoms worsen.",
     *     "disclaimer": "This is an AI-generated preliminary suggestion and not a medical diagnosis."
     *   }
     */
    @PostMapping("/analyze")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<SymptomAnalysisResponse> analyzeSymptoms(
            @Valid @RequestBody SymptomRequest request) {

        log.info("Received symptom analysis request");
        SymptomAnalysisResponse response = symptomAnalyzerService.analyze(request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
