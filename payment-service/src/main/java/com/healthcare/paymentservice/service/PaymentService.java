package com.healthcare.paymentservice.service;

import com.healthcare.paymentservice.dto.CreatePaymentRequest;
import com.healthcare.paymentservice.dto.PaymentResponse;
import com.healthcare.paymentservice.entity.Payment;

public interface PaymentService {
    PaymentResponse createPayment(CreatePaymentRequest request);
    Payment getPaymentById(Long id);
    Payment getPaymentByAppointmentId(Long appointmentId);
}
