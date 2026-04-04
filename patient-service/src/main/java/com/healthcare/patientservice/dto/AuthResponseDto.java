package com.healthcare.patientservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponseDto {
	private String accessToken;
	private String tokenType = "Bearer";
	private long expiresIn;
	private Long patientId;
	private String email;
	private String role;
}


