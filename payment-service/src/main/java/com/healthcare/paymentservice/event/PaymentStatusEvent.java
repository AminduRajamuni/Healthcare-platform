package com.healthcare.paymentservice.event;

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
public class PaymentStatusEvent {

    private String eventId;
    private String timestamp;
    private Long paymentId;
    private String orderId;
    private Long appointmentId;
    private Double amount;
    private String currency;
    private String provider;
    private String status;
    private String statusReason;
}
