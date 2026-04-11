package com.healthcare.symptomcheckerservice.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Configuration for the Hugging Face Inference API client.
 * Note: No longer used as SymptomAnalyzerService uses a deterministic pattern-matching
 * analyzer instead of external API calls.
 *
 * The API key used to be injected from the environment variable HUGGINGFACE_API_KEY
 * via application.properties: huggingface.api.key: ${HUGGINGFACE_API_KEY}
 */
//@Configuration
public class OpenAiConfig {

    @Value("${huggingface.api.key:}")
    private String apiKey;

    /**
     * Exposes the raw API key for Hugging Face API calls.
     */
    public String getApiKey() {
        return apiKey;
    }

    /**
     * General-purpose RestTemplate bean.
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    /**
     * ObjectMapper bean for JSON serialization/deserialization.
     */
    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}
