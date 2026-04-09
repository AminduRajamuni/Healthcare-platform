package com.healthcare.symptomcheckerservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request body sent to the OpenAI Responses API.
 *
 * POST https://api.openai.com/v1/responses
 * {
 *   "model": "gpt-4o-mini",
 *   "input": [
 *     { "role": "user", "content": "..." }
 *   ]
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpenAiRequest {

    private String model;
    private List<OpenAiInputMessage> input;
}
