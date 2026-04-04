package com.healthcare.patientservice.security;

import com.healthcare.patientservice.entity.Patient;
import com.healthcare.patientservice.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

	private final PatientRepository patientRepository;

	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		Patient patient = patientRepository.findByEmailAndDeletedFalse(email)
				.orElseThrow(() -> new UsernameNotFoundException("Patient not found with email: " + email));
		return new PatientUserDetails(patient);
	}
}



