package com.healthcare.symptomcheckerservice.service;

import com.healthcare.symptomcheckerservice.dto.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
public class SymptomAnalyzerService {

    // -----------------------------------------------------------------------
    // Constants
    // -----------------------------------------------------------------------

    private static final String SAFE_DISCLAIMER =
            "This is an AI-generated preliminary suggestion and not a medical diagnosis.";

    // Symptom patterns mapped to conditions and specialties
    private static final Map<String, ConditionPattern> SYMPTOM_PATTERNS = Map.ofEntries(
            new AbstractMap.SimpleEntry<>("chest pain|heart|palpitations|chest tightness",
                    new ConditionPattern(
                            List.of("Acute Coronary Syndrome", "Angina", "Myocarditis"),
                            "Cardiologist", "HIGH")),
            new AbstractMap.SimpleEntry<>("fever|high temp",
                    new ConditionPattern(
                            List.of("Influenza", "Common Cold", "Pneumonia"),
                            "Internal Medicine", "MEDIUM")),
            new AbstractMap.SimpleEntry<>("cough|sore throat|throat",
                    new ConditionPattern(
                            List.of("Pharyngitis", "Laryngitis", "Bronchitis"),
                            "ENT Specialist", "LOW")),
            new AbstractMap.SimpleEntry<>("shortness of breath|breathing|dyspnea",
                    new ConditionPattern(
                            List.of("Bronchitis", "Asthma", "Pneumonia"),
                            "Pulmonologist", "HIGH")),
            new AbstractMap.SimpleEntry<>("headache|migraine",
                    new ConditionPattern(
                            List.of("Tension Headache", "Migraine", "Cluster Headache"),
                            "Neurologist", "LOW")),
            new AbstractMap.SimpleEntry<>("stiff neck|neck pain",
                    new ConditionPattern(
                            List.of("Meningitis", "Cervicalgia", "Torticollis"),
                            "Neurologist", "HIGH")),
            new AbstractMap.SimpleEntry<>("abdominal pain|stomach pain|belly",
                    new ConditionPattern(
                            List.of("Gastroenteritis", "Peptic Ulcer", "Hepatitis"),
                            "Gastroenterologist", "MEDIUM")),
            new AbstractMap.SimpleEntry<>("rash|skin|itching|itch",
                    new ConditionPattern(
                            List.of("Allergic Dermatitis", "Psoriasis", "Eczema"),
                            "Dermatologist", "LOW")),
            new AbstractMap.SimpleEntry<>("joint pain|arthritis|arthralgia",
                    new ConditionPattern(
                            List.of("Osteoarthritis", "Rheumatoid Arthritis", "Gout"),
                            "Rheumatologist", "LOW")),
            new AbstractMap.SimpleEntry<>("vision|eye|blind",
                    new ConditionPattern(
                            List.of("Myopia", "Hyperopia", "Keratitis"),
                            "Ophthalmologist", "LOW"))
    );

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /**
     * Analyze patient-reported symptoms and return structured medical advice.
     * Uses pattern matching to suggest possible conditions and specialty recommendations.
     * Always returns a safe, appropriately cautious response.
     */
    public SymptomAnalysisResponse analyze(SymptomRequest request) {
        try {
            log.info("Analyzing symptoms: [{}]", request.getSymptoms());
            return analyzeSymptomPatterns(request.getSymptoms());
        } catch (Exception ex) {
            log.error("Analysis failed, returning fallback response. Reason: {}", ex.getMessage());
            return buildFallbackResponse();
        }
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    /**
     * Matches symptoms against known patterns and returns clinical suggestions.
     */
    private SymptomAnalysisResponse analyzeSymptomPatterns(String symptoms) {
        String symptomsLower = symptoms.toLowerCase();
        
        // Find matching conditions
        List<String> matchedConditions = new ArrayList<>();
        String recommendedSpecialty = "General Physician";
        String urgency = "LOW";
        
        // Score patterns based on keyword matches
        Map<String, Integer> patternScores = new HashMap<>();
        
        for (var entry : SYMPTOM_PATTERNS.entrySet()) {
            String pattern = entry.getKey();
            ConditionPattern data = entry.getValue();
            
            String[] keywords = pattern.split("\\|");
            int matchCount = 0;
            
            for (String keyword : keywords) {
                if (symptomsLower.contains(keyword.trim())) {
                    matchCount++;
                }
            }
            
            if (matchCount > 0) {
                patternScores.put(pattern, matchCount);
            }
        }
        
        // Use the highest scoring pattern
        if (!patternScores.isEmpty()) {
            String bestPattern = patternScores.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse(null);
            
            if (bestPattern != null) {
                ConditionPattern data = SYMPTOM_PATTERNS.get(bestPattern);
                matchedConditions.addAll(data.conditions);
                recommendedSpecialty = data.specialty;
                urgency = data.urgency;
            }
        }
        
        // If no patterns matched, provide generic response
        if (matchedConditions.isEmpty()) {
            matchedConditions.add("General Medical Evaluation Recommended");
            urgency = "LOW";
        }
        
        // Build advice based on urgency
        String advice = buildAdviceFromUrgency(urgency);
        
        return SymptomAnalysisResponse.builder()
                .possibleConditions(matchedConditions)
                .recommendedSpecialty(recommendedSpecialty)
                .urgency(urgency)
                .advice(advice)
                .disclaimer(SAFE_DISCLAIMER)
                .build();
    }

    /**
     * Builds appropriate medical advice based on urgency level.
     */
    private String buildAdviceFromUrgency(String urgency) {
        return switch (urgency) {
            case "HIGH" -> "These symptoms may indicate a serious condition. Please seek immediate medical attention at an emergency department or call emergency services.";
            case "MEDIUM" -> "These symptoms warrant prompt medical evaluation. Please schedule an appointment with a healthcare provider within 24-48 hours.";
            case "LOW" -> "Please consult with a qualified physician for proper evaluation. Monitor your symptoms and seek immediate care if they worsen.";
            default -> "Please consult a qualified doctor for a proper evaluation.";
        };
    }

    /**
     * Safe fallback response returned when analysis encounters an error.
     */
    private SymptomAnalysisResponse buildFallbackResponse() {
        return SymptomAnalysisResponse.builder()
                .possibleConditions(List.of(
                        "Unable to determine — please consult a doctor"))
                .recommendedSpecialty("General Physician")
                .urgency("LOW")
                .advice("Please consult a qualified doctor for a proper evaluation.")
                .disclaimer(SAFE_DISCLAIMER)
                .build();
    }

    // -----------------------------------------------------------------------
    // Inner class for condition patterns
    // -----------------------------------------------------------------------

    private static class ConditionPattern {
        final List<String> conditions;
        final String specialty;
        final String urgency;

        ConditionPattern(List<String> conditions, String specialty, String urgency) {
            this.conditions = conditions;
            this.specialty = specialty;
            this.urgency = urgency;
        }
    }
}
