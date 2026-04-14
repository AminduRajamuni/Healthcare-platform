package com.healthcare.appointmentservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.getInterceptors().add((request, body, execution) -> {
            org.springframework.web.context.request.RequestAttributes attributes = 
                org.springframework.web.context.request.RequestContextHolder.getRequestAttributes();
            if (attributes instanceof org.springframework.web.context.request.ServletRequestAttributes) {
                jakarta.servlet.http.HttpServletRequest servletRequest = 
                    ((org.springframework.web.context.request.ServletRequestAttributes) attributes).getRequest();
                
                String role = servletRequest.getHeader("X-User-Role");
                String userId = servletRequest.getHeader("X-User-Id");
                String auth = servletRequest.getHeader("Authorization");
                
                if (role != null) request.getHeaders().add("X-User-Role", role);
                if (userId != null) request.getHeaders().add("X-User-Id", userId);
                if (auth != null) request.getHeaders().add("Authorization", auth);
            }
            return execution.execute(request, body);
        });
        return restTemplate;
    }
}
