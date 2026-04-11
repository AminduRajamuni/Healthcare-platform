package com.healthcare.doctorservice.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.healthcare.doctorservice.entity.Doctor;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    Optional<Doctor> findByEmail(String email);

    @Query("""
            SELECT d FROM Doctor d
            WHERE LOWER(d.specialization) = LOWER(:specialization)
              AND d.isAvailable = :isAvailable
              AND (:name IS NULL OR :name = '' OR LOWER(d.name) LIKE LOWER(CONCAT('%', :name, '%')))
            """)
    List<Doctor> searchDoctors(@Param("specialization") String specialization,
            @Param("isAvailable") Boolean isAvailable,
            @Param("name") String name);
}
