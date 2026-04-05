package com.healthcare.notificationservice.util;

import com.healthcare.notificationservice.event.AppointmentEvent;
import org.springframework.stereotype.Component;

@Component
public class EmailTemplateBuilder {

    public String buildAppointmentCreatedEmail(AppointmentEvent event, String doctorName) {
        String template = """
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
                    <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Appointment Confirmed</h2>
                    <p>Dear Patient,</p>
                    <p>Your appointment has been successfully scheduled.</p>
                    
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2ecc71;">
                        <h3 style="margin-top: 0; color: #2c3e50;">Appointment Details:</h3>
                        <ul style="list-style-type: none; padding-left: 0;">
                            <li><strong>Appointment ID:</strong> {appointmentId}</li>
                            <li><strong>Doctor:</strong> {doctorName}</li>
                            <li><strong>Date & Time:</strong> {appointmentDate}</li>
                            <li><strong>Status:</strong> <span style="color: #2ecc71; font-weight: bold;">CONFIRMED</span></li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://meet.jit.si/appointment-{appointmentId}" style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Join Telemedicine Session</a>
                    </div>
                    
                    <p style="background-color: #fff3cd; color: #856404; padding: 10px; border-radius: 5px; font-size: 0.9em;">
                        <strong>Note:</strong> Please be available 10 minutes before your scheduled time.
                    </p>
                    
                    <p style="margin-top: 30px;">Thank you for using our Healthcare Platform.</p>
                    <p style="color: #7f8c8d; font-size: 0.9em;">Regards,<br><strong>Healthcare Team</strong></p>
                </body>
                </html>
                """;

        return template
                .replace("{appointmentId}", String.valueOf(event.getAppointmentId()))
                .replace("{doctorName}", doctorName != null ? doctorName : "TBD")
                .replace("{appointmentDate}", event.getAppointmentDate() != null ? event.getAppointmentDate() : "TBD");
    }

    public String buildAppointmentCancelledEmail(AppointmentEvent event, String doctorName) {
        String template = """
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
                    <h2 style="color: #c0392b; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;">Appointment Cancelled</h2>
                    <p>Dear Patient,</p>
                    <p>Your appointment has been cancelled.</p>
                    
                    <div style="background-color: #fcf3f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #e74c3c;">
                        <h3 style="margin-top: 0; color: #c0392b;">Cancelled Appointment Details:</h3>
                        <ul style="list-style-type: none; padding-left: 0;">
                            <li><strong>Appointment ID:</strong> {appointmentId}</li>
                            <li><strong>Doctor:</strong> {doctorName}</li>
                            <li><strong>Date & Time:</strong> {appointmentDate}</li>
                        </ul>
                    </div>
                    
                    <p>If this was not intended, please rebook your appointment through the portal.</p>
                    
                    <p style="margin-top: 30px;">Regards,</p>
                    <p style="color: #7f8c8d; font-size: 0.9em;"><strong>Healthcare Team</strong></p>
                </body>
                </html>
                """;

        return template
                .replace("{appointmentId}", String.valueOf(event.getAppointmentId()))
                .replace("{doctorName}", doctorName != null ? doctorName : "TBD")
                .replace("{appointmentDate}", event.getAppointmentDate() != null ? event.getAppointmentDate() : "TBD");
    }
}
