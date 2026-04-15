package com.healthcare.symptomcheckerservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a single message in the OpenAI Responses API input array.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OpenAiInputMessage {

    private String role;    // "user" | "assistant" | "system"
    private String content;
}
