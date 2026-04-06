package com.healthcare.patientservice.security.jwt;

import com.healthcare.patientservice.security.PatientUserDetails;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {

	private final SecretKey secretKey;
	private final long jwtExpirationInMs;

	public JwtTokenProvider(@Value("${app.jwt.secret}") String jwtSecret,
							@Value("${app.jwt.expiration-ms}") long jwtExpirationInMs) {
		this.secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
		this.jwtExpirationInMs = jwtExpirationInMs;
	}

	public String generateToken(Authentication authentication) {
		PatientUserDetails userPrincipal = (PatientUserDetails) authentication.getPrincipal();

		Date now = new Date();
		Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

		return Jwts.builder()
				.setSubject(userPrincipal.getUsername())
				.claim("id", userPrincipal.getId())
				.claim("role", userPrincipal.getRole().name())
				.setIssuedAt(now)
				.setExpiration(expiryDate)
				.signWith(secretKey, SignatureAlgorithm.HS512)
				.compact();
	}

	public String getUsernameFromJWT(String token) {
		Claims claims = Jwts.parserBuilder()
					.setSigningKey(secretKey)
					.build()
					.parseClaimsJws(token)
					.getBody();
		return claims.getSubject();
	}

	public boolean validateToken(String authToken) {
		try {
			Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(authToken);
			return true;
		} catch (JwtException | IllegalArgumentException ex) {
			return false;
		}
	}

	public long getJwtExpirationInMs() {
		return jwtExpirationInMs;
	}
}


