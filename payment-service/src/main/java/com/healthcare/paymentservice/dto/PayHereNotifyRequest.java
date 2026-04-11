package com.healthcare.paymentservice.dto;

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
public class PayHereNotifyRequest {

    private String merchantId;
    private String orderId;
    private String paymentId;
    private String payhereAmount;
    private String payhereCurrency;
    private String statusCode;
    private String md5sig;
    private String statusMessage;
    private String method;
    private String custom1;
    private String custom2;
}
