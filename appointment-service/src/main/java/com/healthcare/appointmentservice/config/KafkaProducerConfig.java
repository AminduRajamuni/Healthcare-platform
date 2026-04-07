package com.healthcare.appointmentservice.config;

import com.healthcare.appointmentservice.event.AppointmentEvent;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaProducerConfig {

    @Value("${spring.kafka.producer.bootstrap-servers}")
    private String bootstrapServers;

    @Bean
    public ProducerFactory<String, AppointmentEvent> producerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        // Disable idempotence to avoid compatibility issues with some Kafka broker versions
        configProps.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, false);
        // Reduce retries and timeouts for faster failure detection in development
        configProps.put(ProducerConfig.RETRIES_CONFIG, 1);
        configProps.put(ProducerConfig.REQUEST_TIMEOUT_MS_CONFIG, 5000);
        configProps.put(ProducerConfig.DELIVERY_TIMEOUT_MS_CONFIG, 10000);
        configProps.put(ProducerConfig.MAX_BLOCK_MS_CONFIG, 5000);
        // Disable push metrics (ClientTelemetryReporter) — requires Kafka broker 3.7+.
        configProps.put("enable.metrics.push", false);
        // Disable JMX reporter — it fails during producer construction if JMX MBean
        // registration conflicts, which causes "Failed to construct kafka producer"
        configProps.put(ProducerConfig.METRIC_REPORTER_CLASSES_CONFIG, "");
        return new DefaultKafkaProducerFactory<>(configProps);
    }

    @Bean
    public KafkaTemplate<String, AppointmentEvent> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}
