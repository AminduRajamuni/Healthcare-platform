package com.healthcare.patientservice.service.impl;

import com.healthcare.patientservice.dto.*;
import com.healthcare.patientservice.entity.*;
import com.healthcare.patientservice.exception.EmailAlreadyExistsException;
import com.healthcare.patientservice.exception.InvalidCredentialsException;
import com.healthcare.patientservice.exception.ResourceNotFoundException;
import com.healthcare.patientservice.repository.MedicalHistoryRepository;
import com.healthcare.patientservice.repository.MedicalReportRepository;
import com.healthcare.patientservice.repository.PatientRepository;
import com.healthcare.patientservice.repository.PrescriptionRepository;
import com.healthcare.patientservice.security.PatientUserDetails;
import com.healthcare.patientservice.security.jwt.JwtTokenProvider;
import com.healthcare.patientservice.service.PatientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientServiceImpl implements PatientService {

  private final PatientRepository patientRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtTokenProvider jwtTokenProvider;
  private final MedicalHistoryRepository medicalHistoryRepository;
  private final PrescriptionRepository prescriptionRepository;
  private final MedicalReportRepository medicalReportRepository;

  private final RestTemplate restTemplate;

  @Value("${doctor.service.base-url}")
  private String doctorServiceBaseUrl;

  @Value("${appointment.service.base-url}")
  private String appointmentServiceBaseUrl;

  @Value("${telemedicine.service.base-url}")
  private String telemedicineServiceBaseUrl;

  @Override
  public PatientProfileDto registerPatient(RegisterPatientRequest request) {
    Optional<Patient> existingPatient = patientRepository.findByEmailAndDeletedFalse(request.getEmail());
    if (existingPatient.isPresent()) {
      throw new EmailAlreadyExistsException("Email already exists for a user");
    }

    Patient patient = new Patient();
    patient.setFirstName(request.getFirstName());
    patient.setLastName(request.getLastName());
    patient.setEmail(request.getEmail());
    patient.setPhone(request.getPhone());
    patient.setDob(request.getDob());
    patient.setGender(request.getGender());
    patient.setPassword(passwordEncoder.encode(request.getPassword()));

    Patient saved = patientRepository.save(patient);
    return mapToProfileDto(saved);
  }

  @Override
  public PatientProfileDto getPatientById(Long id) {
    Patient patient = patientRepository.findByIdAndDeletedFalse(id).orElseThrow(
        () -> new ResourceNotFoundException("Patient", "id", id)
    );
    return mapToProfileDto(patient);
  }

  @Override
  public List<PatientListItemDto> getAllPatients() {
    List<Patient> patients = patientRepository.findAllByDeletedFalse();
    return patients.stream()
        .map(this::mapToListItemDto)
        .collect(Collectors.toList());
  }

  @Override
  public PatientProfileDto updatePatient(Long id, UpdatePatientRequest request) {
    Patient existingPatient = patientRepository.findByIdAndDeletedFalse(id).orElseThrow(
        () -> new ResourceNotFoundException("Patient", "id", id)
    );

    // If email were updatable we would handle uniqueness here; currently it's fixed.
    existingPatient.setFirstName(request.getFirstName());
    existingPatient.setLastName(request.getLastName());
    existingPatient.setPhone(request.getPhone());
    existingPatient.setDob(request.getDob());
    existingPatient.setGender(request.getGender());

    Patient updated = patientRepository.save(existingPatient);
    return mapToProfileDto(updated);
  }

  @Override
  public void deletePatient(Long id) {
    Patient existingPatient = patientRepository.findByIdAndDeletedFalse(id).orElseThrow(
        () -> new ResourceNotFoundException("Patient", "id", id)
    );
    existingPatient.setDeleted(true);
    patientRepository.save(existingPatient);
  }

  @Override
  public AuthResponseDto login(LoginRequest loginRequest) {
    // 1. Find patient by email
    Patient patient = patientRepository.findByEmailAndDeletedFalse(loginRequest.getEmail())
        .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

    // 2. Compare raw password with hashed password
    if (!passwordEncoder.matches(loginRequest.getPassword(), patient.getPassword())) {
      throw new InvalidCredentialsException("Invalid email or password");
    }

    // 3. Build Authentication manually for JWT generation
    PatientUserDetails userDetails = new PatientUserDetails(patient);
    Authentication authentication = new UsernamePasswordAuthenticationToken(
        userDetails,
        null,
        userDetails.getAuthorities()
    );

    String token = jwtTokenProvider.generateToken(authentication);
    long expiresIn = jwtTokenProvider.getJwtExpirationInMs();

    AuthResponseDto response = new AuthResponseDto();
    response.setAccessToken(token);
    response.setExpiresIn(expiresIn);
    response.setPatientId(patient.getId());
    response.setEmail(patient.getEmail());
    response.setRole(patient.getRole().name());
    return response;
  }

  @Override
  public List<MedicalHistoryDto> getMedicalHistory(Long patientId) {
    ensureCanAccessPatient(patientId);
    List<MedicalHistory> list = medicalHistoryRepository.findByPatientId(patientId);
    return list.stream().map(this::mapToMedicalHistoryDto).collect(Collectors.toList());
  }

  @Override
  public MedicalHistoryDto addMedicalHistory(Long patientId, CreateMedicalHistoryRequest request) {
    // Only allow access if current user is patient, doctor, or admin; role restriction handled via controller
    ensureCanAccessPatient(patientId);
    MedicalHistory mh = new MedicalHistory();
    mh.setPatientId(patientId);
    mh.setCondition(request.getCondition());
    mh.setNotes(request.getNotes());
    mh.setDate(request.getDate());
    MedicalHistory saved = medicalHistoryRepository.save(mh);
    return mapToMedicalHistoryDto(saved);
  }

  @Override
  public List<PrescriptionDto> getPrescriptions(Long patientId) {
    ensureCanAccessPatient(patientId);
    List<Prescription> list = prescriptionRepository.findByPatientId(patientId);
    return list.stream().map(this::mapToPrescriptionDto).collect(Collectors.toList());
  }

  @Override
  public PrescriptionDto addPrescription(Long patientId, CreatePrescriptionRequest request) {
    // Controller will restrict to DOCTOR/ADMIN, but still ensure patient exists and access is valid
    ensureCanAccessPatient(patientId);
    Prescription p = new Prescription();
    p.setPatientId(patientId);
    p.setDoctorName(request.getDoctorName());
    p.setMedicine(request.getMedicine());
    p.setDosage(request.getDosage());
    p.setDate(request.getDate());
    Prescription saved = prescriptionRepository.save(p);
    return mapToPrescriptionDto(saved);
  }

  @Override
  public List<MedicalReportDto> getMedicalReports(Long patientId) {
    ensureCanAccessPatient(patientId);
    List<MedicalReport> list = medicalReportRepository.findByPatientId(patientId);
    return list.stream().map(this::mapToMedicalReportDto).collect(Collectors.toList());
  }

  @Override
  public MedicalReportDto uploadMedicalReport(Long patientId, MultipartFile file, String description) {
    ensureCanAccessPatient(patientId);
    if (file == null || file.isEmpty()) {
      throw new IllegalArgumentException("File is required");
    }
    try {
      MedicalReport report = new MedicalReport();
      report.setPatientId(patientId);
      report.setFileName(file.getOriginalFilename());
      report.setContentType(file.getContentType());
      report.setDescription(description);
      report.setData(file.getBytes());
      report.setUploadedAt(java.time.LocalDateTime.now());
      MedicalReport saved = medicalReportRepository.save(report);
      return mapToMedicalReportDto(saved);
    } catch (IOException e) {
      throw new RuntimeException("Failed to upload file", e);
    }
  }

  @Override
  public void deleteMedicalReport(Long patientId, Long reportId) {
    ensureCanAccessPatient(patientId);
    MedicalReport report = medicalReportRepository.findByIdAndPatientId(reportId, patientId)
        .orElseThrow(() -> new ResourceNotFoundException("MedicalReport", "id", reportId));
    medicalReportRepository.delete(report);
  }

  @Override
  public List<DoctorDto> searchDoctors(String specialty) {
    String url = doctorServiceBaseUrl;
    if (specialty != null && !specialty.isBlank()) {
      url = url + "?specialty=" + specialty;
    }

    try {
      DoctorDto[] response = restTemplate.getForObject(url, DoctorDto[].class);
      if (response == null) {
        return Collections.emptyList();
      }
      return Arrays.asList(response);
    } catch (RestClientException ex) {
      log.error("Failed to search doctors from doctor-service: {}", ex.getMessage());
      return Collections.emptyList();
    }
  }

  @Override
  public AppointmentDto bookAppointment(Long patientId, BookAppointmentRequest request) {
    ensureCanAccessPatient(patientId);

    // Build payload matching appointment-service's Appointment entity
    Map<String, Object> payload = new HashMap<>();
    payload.put("patientId", patientId);
    payload.put("doctorId", request.getDoctorId());
    // appointment-service expects field name 'appointmentDate'
    payload.put("appointmentDate", request.getAppointmentDateTime());

    try {
      AppointmentDto response = restTemplate.postForObject(
          appointmentServiceBaseUrl,
          payload,
          AppointmentDto.class
      );

      if (response == null) {
        throw new IllegalStateException("Appointment service returned empty response");
      }
      return response;
    } catch (RestClientException ex) {
      log.error("Failed to book appointment via appointment-service: {}", ex.getMessage(), ex);
      throw new IllegalStateException("Failed to book appointment", ex);
    }
  }

  @Override
  public List<AppointmentDto> getPatientAppointments(Long patientId) {
    ensureCanAccessPatient(patientId);

    String url = appointmentServiceBaseUrl + "/patient/" + patientId;

    try {
      AppointmentDto[] response = restTemplate.getForObject(url, AppointmentDto[].class);
      if (response == null) {
        return Collections.emptyList();
      }
      return Arrays.asList(response);
    } catch (RestClientException ex) {
      log.error("Failed to fetch appointments from appointment-service for patient {}: {}", patientId, ex.getMessage());
      return Collections.emptyList();
    }
  }

  @Override
  public TelemedicineSessionDto getVideoLink(Long patientId, Long appointmentId) {
    ensureCanAccessPatient(patientId);

    // First fetch appointment to validate ownership
    String appointmentUrl = appointmentServiceBaseUrl + "/" + appointmentId;
    AppointmentDto appointment;
    try {
      appointment = restTemplate.getForObject(appointmentUrl, AppointmentDto.class);
    } catch (RestClientException ex) {
      log.error("Failed to fetch appointment {} from appointment-service: {}", appointmentId, ex.getMessage(), ex);
      throw new IllegalStateException("Failed to fetch appointment details", ex);
    }

    if (appointment == null) {
      throw new ResourceNotFoundException("Appointment", "id", appointmentId);
    }

    if (!patientId.equals(appointment.getPatientId())) {
      throw new AccessDeniedException("Forbidden");
    }

    // Call telemedicine-service to locate session(s) for this patient, then filter by appointmentId
    String sessionUrl = telemedicineServiceBaseUrl + "/patient/" + patientId;

    // Build an internal JWT for service-to-service call so TelemedicineService trusts the request
    Authentication currentAuth = SecurityContextHolder.getContext().getAuthentication();
    String serviceToken = jwtTokenProvider.generateToken(currentAuth);

    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(serviceToken);
    HttpEntity<Void> entity = new HttpEntity<>(headers);

    try {
      ResponseEntity<TelemedicineSessionDto[]> response = restTemplate.exchange(
          sessionUrl,
          HttpMethod.GET,
          entity,
          TelemedicineSessionDto[].class
      );

      TelemedicineSessionDto[] sessions = response.getBody();
      if (sessions == null || sessions.length == 0) {
        throw new ResourceNotFoundException("TelemedicineSession", "patientId", patientId);
      }

      return Arrays.stream(sessions)
          .filter(s -> appointmentId.equals(s.getAppointmentId()))
          .findFirst()
          .orElseThrow(() -> new ResourceNotFoundException("TelemedicineSession", "appointmentId", appointmentId));

    } catch (RestClientException ex) {
      log.error("Failed to fetch telemedicine sessions for patient {} from telemedicine-service: {}", patientId, ex.getMessage(), ex);
      throw new IllegalStateException("Failed to fetch telemedicine session", ex);
    }
  }

  private void ensureCanAccessPatient(Long pathPatientId) {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !(auth.getPrincipal() instanceof PatientUserDetails userDetails)) {
      throw new AccessDeniedException("Forbidden");
    }

    // PATIENT can only access own data
    if (userDetails.getRole() == Role.PATIENT && !userDetails.getId().equals(pathPatientId)) {
      throw new AccessDeniedException("Forbidden");
    }
  }

  private PatientProfileDto mapToProfileDto(Patient patient) {
    PatientProfileDto dto = new PatientProfileDto();
    dto.setId(patient.getId());
    dto.setFirstName(patient.getFirstName());
    dto.setLastName(patient.getLastName());
    dto.setEmail(patient.getEmail());
    dto.setPhone(patient.getPhone());
    dto.setDob(patient.getDob());
    dto.setGender(patient.getGender());
    dto.setCreatedAt(patient.getCreatedAt());
    dto.setUpdatedAt(patient.getUpdatedAt());
    return dto;
  }

  private PatientListItemDto mapToListItemDto(Patient patient) {
    PatientListItemDto dto = new PatientListItemDto();
    dto.setId(patient.getId());
    dto.setFirstName(patient.getFirstName());
    dto.setLastName(patient.getLastName());
    dto.setEmail(patient.getEmail());
    dto.setPhone(patient.getPhone());
    dto.setCreatedAt(patient.getCreatedAt());
    return dto;
  }

  private MedicalHistoryDto mapToMedicalHistoryDto(MedicalHistory mh) {
    MedicalHistoryDto dto = new MedicalHistoryDto();
    dto.setId(mh.getId());
    dto.setPatientId(mh.getPatientId());
    dto.setCondition(mh.getCondition());
    dto.setNotes(mh.getNotes());
    dto.setDate(mh.getDate());
    return dto;
  }

  private PrescriptionDto mapToPrescriptionDto(Prescription p) {
    PrescriptionDto dto = new PrescriptionDto();
    dto.setId(p.getId());
    dto.setPatientId(p.getPatientId());
    dto.setDoctorName(p.getDoctorName());
    dto.setMedicine(p.getMedicine());
    dto.setDosage(p.getDosage());
    dto.setDate(p.getDate());
    return dto;
  }

  private MedicalReportDto mapToMedicalReportDto(MedicalReport r) {
    MedicalReportDto dto = new MedicalReportDto();
    dto.setId(r.getId());
    dto.setPatientId(r.getPatientId());
    dto.setFileName(r.getFileName());
    dto.setContentType(r.getContentType());
    dto.setDescription(r.getDescription());
    dto.setUploadedAt(r.getUploadedAt());
    return dto;
  }
}
