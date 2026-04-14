package com.healthcare.paymentservice.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.healthcare.paymentservice.dto.CreatePaymentRequest;
import com.healthcare.paymentservice.dto.PayHereInitiateRequest;
import com.healthcare.paymentservice.dto.PayHereInitiateResponse;
import com.healthcare.paymentservice.dto.PayHereNotifyRequest;
import com.healthcare.paymentservice.dto.PaymentResponse;
import com.healthcare.paymentservice.entity.Payment;
import com.healthcare.paymentservice.exception.ResourceNotFoundException;
import com.healthcare.paymentservice.service.PaymentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PaymentResponse> createPayment(@Valid @RequestBody CreatePaymentRequest request) {
        return new ResponseEntity<>(paymentService.createPayment(request), HttpStatus.CREATED);
    }

    @PostMapping("/payhere/initiate")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PayHereInitiateResponse> initiatePayHerePayment(
            @Valid @RequestBody PayHereInitiateRequest request) {
        return new ResponseEntity<>(paymentService.initiatePayHerePayment(request), HttpStatus.CREATED);
    }

    @PostMapping(value = "/payhere/notify", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<String> handlePayHereNotify(
            @RequestParam("merchant_id") String merchantId,
            @RequestParam("order_id") String orderId,
            @RequestParam("payment_id") String paymentId,
            @RequestParam("payhere_amount") String payhereAmount,
            @RequestParam("payhere_currency") String payhereCurrency,
            @RequestParam("status_code") String statusCode,
            @RequestParam("md5sig") String md5sig,
            @RequestParam("status_message") String statusMessage,
            @RequestParam("method") String method,
            @RequestParam(value = "custom_1", required = false) String custom1,
            @RequestParam(value = "custom_2", required = false) String custom2) {

        PayHereNotifyRequest request = PayHereNotifyRequest.builder()
                .merchantId(merchantId)
                .orderId(orderId)
                .paymentId(paymentId)
                .payhereAmount(payhereAmount)
                .payhereCurrency(payhereCurrency)
                .statusCode(statusCode)
                .md5sig(md5sig)
                .statusMessage(statusMessage)
                .method(method)
                .custom1(custom1)
                .custom2(custom2)
                .build();

        try {
            paymentService.handlePayHereNotify(request);
            return ResponseEntity.ok("ACKNOWLEDGED");
        } catch (ResourceNotFoundException ex) {
            return new ResponseEntity<>("ERROR: " + ex.getMessage(), HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException | IllegalStateException ex) {
            return new ResponseEntity<>("ERROR: " + ex.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception ex) {
            return new ResponseEntity<>("ERROR: Unable to process PayHere callback", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/payhere/return")
    public ResponseEntity<String> handlePayHereReturn() {
        return ResponseEntity.ok("Returned from PayHere. Please check payment status from the application.");
    }

    @GetMapping("/payhere/cancel")
    public ResponseEntity<String> handlePayHereCancel() {
        return ResponseEntity.ok("Payment cancelled on PayHere. You can retry the payment from the application.");
    }

    @GetMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @GetMapping("/order/{orderId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<Payment> getPaymentByOrderId(@PathVariable String orderId) {
        return ResponseEntity.ok(paymentService.getPaymentByOrderId(orderId));
    }

    @PostMapping("/order/{orderId}/cancel")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<Payment> cancelPaymentByOrderId(@PathVariable String orderId) {
        return ResponseEntity.ok(paymentService.cancelPaymentByOrderId(orderId));
    }

    @GetMapping("/appointment/{appointmentId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<Payment> getPaymentByAppointmentId(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(paymentService.getPaymentByAppointmentId(appointmentId));
    }
}
