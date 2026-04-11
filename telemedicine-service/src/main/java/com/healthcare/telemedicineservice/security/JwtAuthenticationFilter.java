package com.healthcare.telemedicineservice.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtTokenProvider jwtTokenProvider;

	public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
		this.jwtTokenProvider = jwtTokenProvider;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request,
									 HttpServletResponse response,
									 FilterChain filterChain) throws ServletException, IOException {
		String token = getJwtFromRequest(request);

		if (StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {
			Jws<Claims> jws = jwtTokenProvider.parseToken(token);
			Claims claims = jws.getBody();

			String username = claims.getSubject();
			String role = claims.get("role", String.class);
			Long userId = null;
			Object idClaim = claims.get("id");
			if (idClaim instanceof Number number) {
				userId = number.longValue();
			}

			GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);
			TelemedicineUserPrincipal principal = new TelemedicineUserPrincipal(userId, username, role, List.of(authority));

			UsernamePasswordAuthenticationToken authentication =
					new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
			authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
			SecurityContextHolder.getContext().setAuthentication(authentication);
		}

		filterChain.doFilter(request, response);
	}

	private String getJwtFromRequest(HttpServletRequest request) {
		String bearerToken = request.getHeader("Authorization");
		if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
			return bearerToken.substring(7);
		}
		return null;
	}
}

