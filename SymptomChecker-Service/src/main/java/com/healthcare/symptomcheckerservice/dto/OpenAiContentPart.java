package com.healthcare.symptomcheckerservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents one text part inside an OpenAI output message content array.
 * e.g. { "type": "output_text", "text": "..." }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class OpenAiContentPart {

    private String type;   // "output_text"
    private String text;
}
