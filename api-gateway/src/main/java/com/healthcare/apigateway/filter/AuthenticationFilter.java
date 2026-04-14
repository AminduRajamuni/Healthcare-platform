package com.healthcare.apigateway.filter;

import com.healthcare.apigateway.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Autowired
    private JwtUtil jwtUtil;

    public AuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            
            // DEVELOPMENT MODE: Bypass auth for symptom checker
            String path = request.getURI().getPath();
            if (path.contains("/api/symptoms")) {
                // Add default headers for symptom checker
                request = request.mutate()
                        .header("X-User-Id", "dev-user")
                        .header("X-User-Role", "PATIENT")
                        .build();
                return chain.filter(exchange.mutate().request(request).build());
            }

            // Check if the route is secured
            if (isSecured(request)) {
                if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                    return onError(exchange, "Missing authorization header", HttpStatus.UNAUTHORIZED);
                }

                String authHeader = request.getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    authHeader = authHeader.substring(7);
                }

                try {
                    if (jwtUtil.isInvalid(authHeader)) {
                        return onError(exchange, "Token is expired or invalid", HttpStatus.UNAUTHORIZED);
                    }

                    // Extract user info
                    String userId = jwtUtil.extractUserId(authHeader);
                    String role = jwtUtil.extractRole(authHeader);

                    // Attach headers downstream
                    request = exchange.getRequest()
                            .mutate()
                            .header("X-User-Id", userId)
                            .header("X-User-Role", role)
                            .build();

                } catch (Exception e) {
                    return onError(exchange, "Unauthorized access to application", HttpStatus.UNAUTHORIZED);
                }
            }

            return chain.filter(exchange.mutate().request(request).build());
        };
    }

    private boolean isSecured(ServerHttpRequest request) {
        // Exclude /register, /login, /auth, and /api/symptoms (SymptomChecker)
        // from authentication checks for development
        String path = request.getURI().getPath();
        boolean isPublic = path.contains("/register") || 
                          path.contains("/login") || 
                          path.contains("/auth") || 
                          path.contains("/api/symptoms");
        
        return !isPublic;  // If not public, it needs auth
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        return response.setComplete();
    }

    public static class Config {
        // configuration properties
    }
}
