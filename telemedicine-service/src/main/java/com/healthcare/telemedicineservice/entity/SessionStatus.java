package com.healthcare.telemedicineservice.entity;

/**
 * Lifecycle status of a telemedicine session.
 */
public enum SessionStatus {
  /** Session has been created for a confirmed appointment but not yet started. */
  SCHEDULED,
  /** Session is ongoing (at least one participant has joined). */
  ONGOING,
  /** Session has been successfully completed. */
  COMPLETED,
  /** Session was cancelled before completion. */
  CANCELLED
}
