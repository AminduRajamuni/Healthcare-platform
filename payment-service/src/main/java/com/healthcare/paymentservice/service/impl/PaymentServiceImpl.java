package com.healthcare.paymentservice.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.healthcare.paymentservice.config.PayHereProperties;
import com.healthcare.paymentservice.dto.CreatePaymentRequest;
import com.healthcare.paymentservice.dto.PayHereInitiateRequest;
import com.healthcare.paymentservice.dto.PayHereInitiateResponse;
import com.healthcare.paymentservice.dto.PayHereNotifyRequest;
import com.healthcare.paymentservice.dto.PaymentResponse;
import com.healthcare.paymentservice.entity.Payment;
import com.healthcare.paymentservice.entity.PaymentStatus;
import com.healthcare.paymentservice.event.PaymentStatusEvent;
import com.healthcare.paymentservice.exception.DuplicatePaymentException;
import com.healthcare.paymentservice.exception.ResourceNotFoundException;
import com.healthcare.paymentservice.repository.PaymentRepository;
import com.healthcare.paymentservice.service.PaymentService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final RestTemplate restTemplate;
    private final PayHereProperties payHereProperties;
    private final ObjectProvider<KafkaTemplate<Object, Object>> kafkaTemplateProvider;

    @Value("${services.appointment.base-url:http://appointment-service:8082}")
    private String appointmentServiceBaseUrl;

    @Value("${events.payment.topic:payment.events}")
    private String paymentEventsTopic;

    @Override
    public PaymentResponse createPayment(CreatePaymentRequest request) {
        log.info("Initiating payment for Appointment ID: {}", request.getAppointmentId());

        if (paymentRepository.existsByAppointmentId(request.getAppointmentId())) {
            log.error("Payment already exists for Appointment ID {}", request.getAppointmentId());
            throw new DuplicatePaymentException("A payment already exists for this appointment.");
        }

        // Generate identifiers for local record and gateway checkout order.
        String transactionId = "txn_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        String orderId = "PH_ORDER_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        LocalDateTime now = LocalDateTime.now();
        String currency = request.getCurrency() == null || request.getCurrency().isBlank()
                ? "LKR"
                : request.getCurrency();

        Payment payment = Payment.builder()
                .appointmentId(request.getAppointmentId())
                .amount(request.getAmount())
                .status(PaymentStatus.PENDING)
                .transactionId(transactionId)
                .orderId(orderId)
                .provider("PAYHERE")
                .currency(currency)
                .gatewayPaymentId(null)
                .statusReason("PAYHERE_CHECKOUT_INITIALIZED")
                .createdAt(now)
                .updatedAt(now)
                .build();

        payment = paymentRepository.save(payment);
        log.info("PayHere checkout initialized with Transaction ID: {} and Order ID: {}",
                payment.getTransactionId(), payment.getOrderId());

        return PaymentResponse.builder()
                .id(payment.getId())
                .status(payment.getStatus())
                .transactionId(payment.getTransactionId())
                .amount(payment.getAmount())
                .orderId(payment.getOrderId())
                .provider(payment.getProvider())
                .currency(payment.getCurrency())
                .gatewayPaymentId(payment.getGatewayPaymentId())
                .statusReason(payment.getStatusReason())
                .updatedAt(payment.getUpdatedAt())
                .merchantId(payHereProperties.getMerchantId())
                .checkoutUrl(payHereProperties.getCheckoutUrl())
                .returnUrl(payHereProperties.getReturnUrl())
                .cancelUrl(payHereProperties.getCancelUrl())
                .notifyUrl(payHereProperties.getNotifyUrl())
                .sandbox(payHereProperties.getSandbox())
                .build();
    }

    @Override
    public PayHereInitiateResponse initiatePayHerePayment(PayHereInitiateRequest request) {
        log.info("Initiating PayHere checkout for Appointment ID: {}", request.getAppointmentId());

        validatePayHereConfig();
        validateAppointmentExists(request.getAppointmentId());

        if (paymentRepository.existsByAppointmentId(request.getAppointmentId())) {
            log.error("Payment already exists for Appointment ID {}", request.getAppointmentId());
            throw new DuplicatePaymentException("A payment already exists for this appointment.");
        }

        String orderId = "PH_ORDER_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        String transactionId = "txn_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        LocalDateTime now = LocalDateTime.now();
        String currency = request.getCurrency().toUpperCase(Locale.ROOT);
        String amount = formatAmount(request.getAmount());

        Payment payment = Payment.builder()
                .appointmentId(request.getAppointmentId())
                .amount(request.getAmount())
                .status(PaymentStatus.PENDING)
                .transactionId(transactionId)
                .orderId(orderId)
                .provider("PAYHERE")
                .currency(currency)
                .gatewayPaymentId(null)
                .statusReason("PAYHERE_CHECKOUT_INITIATED")
                .createdAt(now)
                .updatedAt(now)
                .build();

        payment = paymentRepository.save(payment);

        String hash = generatePayHereHash(
                payHereProperties.getMerchantId(),
                orderId,
                amount,
                currency,
                payHereProperties.getMerchantSecret());

        return PayHereInitiateResponse.builder()
                .checkoutUrl(payHereProperties.getCheckoutUrl())
                .merchantId(payHereProperties.getMerchantId())
                .returnUrl(payHereProperties.getReturnUrl())
                .cancelUrl(payHereProperties.getCancelUrl())
                .notifyUrl(payHereProperties.getNotifyUrl())
                .orderId(orderId)
                .items("Appointment Payment #" + request.getAppointmentId())
                .currency(currency)
                .amount(amount)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .city(request.getCity())
                .country(request.getCountry())
                .hash(hash)
                .sandbox(payHereProperties.getSandbox())
                .paymentId(payment.getId())
                .appointmentId(payment.getAppointmentId())
                .provider(payment.getProvider())
                .build();
    }

    @Override
    public void handlePayHereNotify(PayHereNotifyRequest request) {
        log.info("Received PayHere callback for order ID: {}", request.getOrderId());

        validateNotifyConfig();
        validateNotifyMerchant(request.getMerchantId());
        validateNotifySignature(request);

        Payment payment = paymentRepository.findByOrderId(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order ID: " + request.getOrderId()));

        PaymentStatus previousStatus = payment.getStatus();
        PaymentStatus mappedStatus = mapPayHereStatusCode(request.getStatusCode());

        transitionPaymentState(payment, mappedStatus);

        if (!isBlank(request.getPaymentId())) {
            payment.setGatewayPaymentId(request.getPaymentId());
        }
        payment.setStatusReason(buildNotifyStatusReason(request));
        payment.setUpdatedAt(LocalDateTime.now());

        payment = paymentRepository.save(payment);

        if (didTransitionToFinalStatus(previousStatus, payment.getStatus())) {
            publishFinalStatusEventAsync(payment);
        }
    }

    private void validatePayHereConfig() {
        if (isBlank(payHereProperties.getMerchantId())
                || isBlank(payHereProperties.getMerchantSecret())
                || isBlank(payHereProperties.getCheckoutUrl())) {
            throw new IllegalStateException("PayHere configuration is incomplete.");
        }
    }

    private void validateAppointmentExists(Long appointmentId) {
        String url = appointmentServiceBaseUrl + "/api/appointments/" + appointmentId;
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new IllegalStateException("Appointment validation failed for ID: " + appointmentId);
            }

            Map<?, ?> appointment = response.getBody();
            if (appointment == null) {
                throw new IllegalStateException("Appointment payload missing for ID: " + appointmentId);
            }

            Object status = appointment.get("status");
            if (status != null && "CANCELLED".equalsIgnoreCase(status.toString())) {
                throw new IllegalStateException("Cannot initiate payment for a CANCELLED appointment.");
            }
        } catch (HttpClientErrorException.NotFound ex) {
            throw new ResourceNotFoundException("Appointment not found with ID: " + appointmentId);
        } catch (RestClientException ex) {
            throw new IllegalStateException("Unable to validate appointment with appointment-service.");
        }
    }

    private String formatAmount(Double amount) {
        return BigDecimal.valueOf(amount)
                .setScale(2, RoundingMode.HALF_UP)
                .toPlainString();
    }

    private void validateNotifyMerchant(String merchantId) {
        if (isBlank(merchantId)) {
            throw new IllegalArgumentException("merchant_id is required.");
        }
        if (!merchantId.equals(payHereProperties.getMerchantId())) {
            throw new IllegalArgumentException("Invalid merchant_id in PayHere callback.");
        }
    }

    private void validateNotifyConfig() {
        if (isBlank(payHereProperties.getMerchantId()) || isBlank(payHereProperties.getMerchantSecret())) {
            throw new IllegalStateException("PayHere notify configuration is incomplete.");
        }
    }

    private void validateNotifySignature(PayHereNotifyRequest request) {
        String secretMd5 = md5(payHereProperties.getMerchantSecret()).toUpperCase(Locale.ROOT);
        String rawChecksum = request.getMerchantId()
                + request.getOrderId()
                + request.getPayhereAmount()
                + request.getPayhereCurrency()
                + request.getStatusCode()
                + secretMd5;

        String expectedMd5Sig = md5(rawChecksum).toUpperCase(Locale.ROOT);
        if (!expectedMd5Sig.equals(request.getMd5sig())) {
            throw new IllegalArgumentException("Invalid md5sig in PayHere callback.");
        }
    }

    private PaymentStatus mapPayHereStatusCode(String statusCode) {
        return switch (statusCode) {
            case "2" ->
                PaymentStatus.SUCCESS;
            case "0" ->
                PaymentStatus.PENDING;
            case "-1", "-2", "-3" ->
                PaymentStatus.FAILED;
            default ->
                throw new IllegalArgumentException("Unsupported PayHere status_code: " + statusCode);
        };
    }

    private String buildNotifyStatusReason(PayHereNotifyRequest request) {
        String message = isBlank(request.getStatusMessage())
                ? "PAYHERE_NOTIFY_STATUS_" + request.getStatusCode()
                : request.getStatusMessage();

        String method = isBlank(request.getMethod()) ? "UNKNOWN" : request.getMethod();
        String custom1 = request.getCustom1() == null ? "" : request.getCustom1();
        String custom2 = request.getCustom2() == null ? "" : request.getCustom2();

        return message + " | method=" + method + " | custom_1=" + custom1 + " | custom_2=" + custom2;
    }

    private boolean didTransitionToFinalStatus(PaymentStatus previousStatus, PaymentStatus currentStatus) {
        if (previousStatus == currentStatus) {
            return false;
        }
        return currentStatus == PaymentStatus.SUCCESS || currentStatus == PaymentStatus.FAILED;
    }

    private void publishFinalStatusEventAsync(Payment payment) {
        KafkaTemplate<Object, Object> kafkaTemplate = kafkaTemplateProvider.getIfAvailable();
        if (kafkaTemplate == null) {
            log.warn("KafkaTemplate is unavailable. Skipping payment event publish for order ID: {}", payment.getOrderId());
            return;
        }

        PaymentStatusEvent event = PaymentStatusEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .timestamp(LocalDateTime.now().toString())
                .paymentId(payment.getId())
                .orderId(payment.getOrderId())
                .appointmentId(payment.getAppointmentId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .provider(payment.getProvider())
                .status(payment.getStatus().name())
                .statusReason(payment.getStatusReason())
                .build();

        try {
            String payload = buildEventPayload(event);
            kafkaTemplate.send(paymentEventsTopic, payment.getOrderId(), payload)
                    .whenComplete((result, ex) -> {
                        if (ex != null) {
                            log.error("Failed to publish payment event for order ID: {}", payment.getOrderId(), ex);
                        } else {
                            log.info("Published payment event for order ID: {}", payment.getOrderId());
                        }
                    });
        } catch (Exception ex) {
            // Do not fail request; payment DB state is already committed and remains source of truth.
            log.error("Failed to enqueue payment event for order ID: {}", payment.getOrderId(), ex);
        }
    }

    private String buildEventPayload(PaymentStatusEvent event) {
        return "eventId=" + event.getEventId()
                + ",timestamp=" + event.getTimestamp()
                + ",paymentId=" + event.getPaymentId()
                + ",orderId=" + event.getOrderId()
                + ",appointmentId=" + event.getAppointmentId()
                + ",amount=" + event.getAmount()
                + ",currency=" + event.getCurrency()
                + ",provider=" + event.getProvider()
                + ",status=" + event.getStatus()
                + ",statusReason=" + event.getStatusReason();
    }

    private void transitionPaymentState(Payment payment, PaymentStatus targetStatus) {
        PaymentStatus currentStatus = payment.getStatus();

        if (currentStatus == targetStatus) {
            return;
        }

        if (currentStatus == PaymentStatus.SUCCESS) {
            throw new IllegalStateException("Cannot change payment state after SUCCESS.");
        }

        if (currentStatus == PaymentStatus.PENDING
                && (targetStatus == PaymentStatus.SUCCESS
                || targetStatus == PaymentStatus.FAILED
                || targetStatus == PaymentStatus.CANCELLED)) {
            payment.setStatus(targetStatus);
            return;
        }

        throw new IllegalStateException(
                "Invalid payment state transition: " + currentStatus + " -> " + targetStatus);
    }

    private String generatePayHereHash(String merchantId, String orderId, String amount, String currency,
            String merchantSecret) {
        String merchantSecretMd5 = md5(merchantSecret).toUpperCase(Locale.ROOT);
        String rawHash = merchantId + orderId + amount + currency + merchantSecretMd5;
        return md5(rawHash).toUpperCase(Locale.ROOT);
    }

    private String md5(String value) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder builder = new StringBuilder();
            for (byte b : digest) {
                builder.append(String.format("%02x", b));
            }
            return builder.toString();
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("MD5 algorithm is not available.", ex);
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    @Override
    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + id));
    }

    @Override
    public Payment getPaymentByOrderId(String orderId) {
        return paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order ID: " + orderId));
    }

    @Override
    public Payment cancelPaymentByOrderId(String orderId) {
        Payment payment = getPaymentByOrderId(orderId);
        transitionPaymentState(payment, PaymentStatus.CANCELLED);
        payment.setStatusReason("PAYMENT_CANCELLED_BY_USER");
        payment.setUpdatedAt(LocalDateTime.now());
        return paymentRepository.save(payment);
    }

    @Override
    public Payment getPaymentByAppointmentId(Long appointmentId) {
        return paymentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for Appointment ID: " + appointmentId));
    }
}
