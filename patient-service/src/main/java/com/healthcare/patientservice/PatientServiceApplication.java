package com.healthcare.patientservice;

import com.healthcare.patientservice.entity.Patient;
import com.healthcare.patientservice.entity.Role;
import com.healthcare.patientservice.repository.PatientRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.LocalDate;

@SpringBootApplication
public class PatientServiceApplication {

        public static void main(String[] args) {
                SpringApplication.run(PatientServiceApplication.class, args);   
        }

        @Bean
        public CommandLineRunner initAdmin(PatientRepository patientRepository) {
                return args -> {
                        String adminEmail = "admin@healthcare.com";
                        if (patientRepository.findByEmailAndDeletedFalse(adminEmail).isEmpty()) {
                                Patient admin = new Patient();
                                admin.setFirstName("System");
                                admin.setLastName("Admin");
                                admin.setEmail(adminEmail);
                                admin.setPassword("admin123");
                                admin.setPhone("1234567890");
                                admin.setGender("Other");
                                admin.setRole(Role.ADMIN);
                                admin.setDob(LocalDate.of(2000, 1, 1));
                                patientRepository.save(admin);
                                System.out.println("Admin user created: " + adminEmail + " / admin123");
                        }
                };
        }
}
