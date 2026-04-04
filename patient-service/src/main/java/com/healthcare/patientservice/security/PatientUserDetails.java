package com.healthcare.patientservice.security;

import com.healthcare.patientservice.entity.Patient;
import com.healthcare.patientservice.entity.Role;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class PatientUserDetails implements UserDetails {

	private final Patient patient;

	public PatientUserDetails(Patient patient) {
		this.patient = patient;
	}

	public Long getId() {
		return patient.getId();
	}

	public Role getRole() {
		return patient.getRole();
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		String roleName = "ROLE_" + patient.getRole().name();
		return List.of(new SimpleGrantedAuthority(roleName));
	}

	@Override
	public String getPassword() {
		return patient.getPassword();
	}

	@Override
	public String getUsername() {
		return patient.getEmail();
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return true;
	}
}


