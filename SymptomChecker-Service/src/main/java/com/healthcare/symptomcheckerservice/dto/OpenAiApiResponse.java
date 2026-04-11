package com.healthcare.symptomcheckerservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Top-level response from the OpenAI Responses API.
 *
 * {
 *   "id": "resp_...",
 *   "object": "response",
 *   "model": "gpt-4o-mini",
 *   "output": [
 *     {
 *       "type": "message",
 *       "role": "assistant",
 *       "content": [
 *         { "type": "output_text", "text": "{ ...json... }" }
 *       ]
 *     }
 *   ]
 * }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class OpenAiApiResponse {

    private String id;
    private String object;
    private String model;
    private List<OpenAiOutputItem> output;
}
