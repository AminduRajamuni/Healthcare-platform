package com.healthcare.paymentservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

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
public class PayHereInitiateResponse {

    private String checkoutUrl;

    @JsonProperty("merchant_id")
    private String merchantId;

    @JsonProperty("return_url")
    private String returnUrl;

    @JsonProperty("cancel_url")
    private String cancelUrl;

    @JsonProperty("notify_url")
    private String notifyUrl;

    @JsonProperty("order_id")
    private String orderId;

    private String items;
    private String currency;
    private String amount;

    @JsonProperty("first_name")
    private String firstName;

    @JsonProperty("last_name")
    private String lastName;

    private String email;
    private String phone;
    private String address;
    private String city;
    private String country;
    private String hash;
    private Boolean sandbox;

    private Long paymentId;
    private Long appointmentId;
    private String provider;
}
