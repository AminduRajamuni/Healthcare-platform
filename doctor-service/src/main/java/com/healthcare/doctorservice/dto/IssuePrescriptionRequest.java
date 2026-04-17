package com.healthcare.doctorservice.dto;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class IssuePrescriptionRequest {

    @NotEmpty(message = "At least one medicine is required")
    private List<MedicineDosage> medicines;

    private String description;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MedicineDosage {

        @NotNull(message = "Medicine is required")
        private String medicine;

        @NotNull(message = "Dosage is required")
        private String dosage;
    }
}
