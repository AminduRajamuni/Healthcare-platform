package com.healthcare.paymentservice.dto;

import java.time.LocalDateTime;

import com.healthcare.paymentservice.entity.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {

    private Long id;
    private PaymentStatus status;
    private String transactionId;
    private Double amount;
    private String orderId;
    private String provider;
    private String currency;
    private String gatewayPaymentId;
    private String statusReason;
    private LocalDateTime updatedAt;

    private String merchantId;
    private String checkoutUrl;
    private String returnUrl;
    private String cancelUrl;
    private String notifyUrl;
    private Boolean sandbox;
}
