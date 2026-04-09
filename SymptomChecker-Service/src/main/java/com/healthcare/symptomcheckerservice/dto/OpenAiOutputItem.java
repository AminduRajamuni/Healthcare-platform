package com.healthcare.symptomcheckerservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Represents one output item in the OpenAI Responses API response.
 * e.g. { "type": "message", "role": "assistant", "content": [...] }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class OpenAiOutputItem {

    private String type;                     // "message"
    private String id;
    private String role;                     // "assistant"
    private List<OpenAiContentPart> content; // array of content parts
}
