package com.healthcare.notificationservice.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender javaMailSender;

    public void sendEmail(String to, String subject, String body) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom("nsccarrentals@gmail.com"); 
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true); // Set to true to enable HTML content!

            javaMailSender.send(message);
        } catch (Exception e) {
            // Wrapping checked MessagingExceptions into an unchecked exception
            throw new RuntimeException("Failed to wrap or send MimeMessage", e);
        }
    }
}
