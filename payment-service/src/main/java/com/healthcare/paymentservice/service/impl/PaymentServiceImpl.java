package com.healthcare.paymentservice.service.impl;

import com.healthcare.paymentservice.dto.CreatePaymentRequest;
import com.healthcare.paymentservice.dto.PaymentResponse;
import com.healthcare.paymentservice.entity.Payment;
import com.healthcare.paymentservice.entity.PaymentStatus;
import com.healthcare.paymentservice.exception.DuplicatePaymentException;
import com.healthcare.paymentservice.exception.ResourceNotFoundException;
import com.healthcare.paymentservice.repository.PaymentRepository;
import com.healthcare.paymentservice.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;

    @Override
    public PaymentResponse createPayment(CreatePaymentRequest request) {
        log.info("Initiating payment for Appointment ID: {}", request.getAppointmentId());

        if (paymentRepository.existsByAppointmentId(request.getAppointmentId())) {
            log.error("Payment already exists for Appointment ID {}", request.getAppointmentId());
            throw new DuplicatePaymentException("A payment already exists for this appointment.");
        }

        // Simulate Stripe API call - generate unique transaction id
        String transactionId = "txn_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        Payment payment = Payment.builder()
                .appointmentId(request.getAppointmentId())
                .amount(request.getAmount())
                .status(PaymentStatus.SUCCESS) // Simulated Success
                .transactionId(transactionId)
                .createdAt(LocalDateTime.now())
                .build();

        payment = paymentRepository.save(payment);
        log.info("Payment successfully processed with Transaction ID: {}", payment.getTransactionId());

        return PaymentResponse.builder()
                .id(payment.getId())
                .status(payment.getStatus())
                .transactionId(payment.getTransactionId())
                .amount(payment.getAmount())
                .build();
    }

    @Override
    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + id));
    }

    @Override
    public Payment getPaymentByAppointmentId(Long appointmentId) {
        return paymentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for Appointment ID: " + appointmentId));
    }
}
