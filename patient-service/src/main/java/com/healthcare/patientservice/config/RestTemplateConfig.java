package com.healthcare.patientservice.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class RestTemplateConfig {

  @Bean
  public RestTemplate restTemplate() {
    SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
    factory.setConnectTimeout(5000); // 5 seconds
    factory.setReadTimeout(10000);   // 10 seconds

    RestTemplate restTemplate = new RestTemplate(factory);
    List<ClientHttpRequestInterceptor> interceptors = new ArrayList<>();
    interceptors.add((request, body, execution) -> {
      var attrs = RequestContextHolder.getRequestAttributes();
      if (attrs instanceof ServletRequestAttributes servletRequestAttributes) {
        HttpServletRequest httpRequest = servletRequestAttributes.getRequest();
        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader != null && !authHeader.isBlank()) {
          request.getHeaders().add("Authorization", authHeader);
        }
      }
      return execution.execute(request, body);
    });
    restTemplate.setInterceptors(interceptors);
    return restTemplate;
  }
}

