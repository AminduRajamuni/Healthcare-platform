package com.healthcare.apigateway.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    // Ideally, load this from environment variables.
    // Must be at least 256 bits (32 bytes) long.
    private static final String SECRET = "5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437";

    private SecretKey getSignKey() {
        byte[] keyBytes = io.jsonwebtoken.io.Decoders.BASE64.decode(SECRET);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public Claims getAllClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private boolean isTokenExpired(String token) {
        return this.getAllClaimsFromToken(token).getExpiration().before(new Date());
    }

    public boolean isInvalid(String token) {
         return this.isTokenExpired(token);
    }

    public String extractUserId(String token) {
        // Assume ID is stored in subject. If it's a claim, use get("id")
        return getAllClaimsFromToken(token).getSubject();
    }

    public String extractRole(String token) {
        return getAllClaimsFromToken(token).get("role", String.class);
    }
}
