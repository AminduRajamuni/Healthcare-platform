package com.healthcare.paymentservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "payhere")
public class PayHereProperties {

    private String merchantId;
    private String merchantSecret;
    private String checkoutUrl;
    private String returnUrl;
    private String cancelUrl;
    private String notifyUrl;
    private Boolean sandbox;
}
