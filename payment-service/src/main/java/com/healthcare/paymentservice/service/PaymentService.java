package com.healthcare.paymentservice.service;

import java.util.List;

import com.healthcare.paymentservice.dto.CreatePaymentRequest;
import com.healthcare.paymentservice.dto.PayHereInitiateRequest;
import com.healthcare.paymentservice.dto.PayHereInitiateResponse;
import com.healthcare.paymentservice.dto.PayHereNotifyRequest;
import com.healthcare.paymentservice.dto.PaymentResponse;
import com.healthcare.paymentservice.entity.Payment;

public interface PaymentService {

    PaymentResponse createPayment(CreatePaymentRequest request);

    PayHereInitiateResponse initiatePayHerePayment(PayHereInitiateRequest request);

    void handlePayHereNotify(PayHereNotifyRequest request);

    Payment getPaymentById(Long id);

    Payment getPaymentByOrderId(String orderId);

    Payment cancelPaymentByOrderId(String orderId);

    Payment getPaymentByAppointmentId(Long appointmentId);

    List<Payment> getAllPayments();
}
