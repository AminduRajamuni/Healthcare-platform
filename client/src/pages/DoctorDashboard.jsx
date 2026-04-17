import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  FileText,
  Video,
  Activity,
  Clock,
  LogOut,
  User,
  Mail,
  Phone,
  CheckCircle,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import appointmentService from "../services/appointmentService";
import doctorService from "../services/doctorService";
import patientService from "../services/patientService";
import AppointmentCard from "../components/AppointmentCard";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const userEmail = localStorage.getItem("email");

  const [appointments, setAppointments] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("schedule");
  const [sectionLoading, setSectionLoading] = useState(false);
  const [sectionError, setSectionError] = useState("");
  const [sectionMessage, setSectionMessage] = useState("");

  const [doctorPatients, setDoctorPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [patientReports, setPatientReports] = useState([]);

  const [doctorSchedules, setDoctorSchedules] = useState([]);
  const [scheduleForm, setScheduleForm] = useState({
    scheduleDate: "",
    startTime: "",
    endTime: "",
  });
  const [slotDate, setSlotDate] = useState("");
  const [searchedAppointments, setSearchedAppointments] = useState([]);

  const [prescriptionForm, setPrescriptionForm] = useState({
    patientId: "",
    medicines: [{ medicine: "", dosage: "" }],
    description: "",
  });
  const [telemedicineSessions, setTelemedicineSessions] = useState([]);
  const [historyTab, setHistoryTab] = useState("appointments");
  const [doctorPrescriptions, setDoctorPrescriptions] = useState([]);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({ email: "", phone: "" });
  const [profileSaving, setProfileSaving] = useState(false);

  const getDateFromValue = (value) => {
    if (Array.isArray(value)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = value;
      return new Date(year, (month || 1) - 1, day || 1, hour, minute, second);
    }
    return new Date(value);
  };

  const formatDate = (value) => {
    const parsed = getDateFromValue(value);
    if (Number.isNaN(parsed.getTime())) {
      return "N/A";
    }
    return parsed.toLocaleDateString();
  };

  const formatTime = (value) => {
    if (!value) return "--:--";
    if (typeof value === "string") {
      return value.slice(0, 5);
    }
    return value;
  };

  const buildPatientCollection = async (appointmentsData) => {
    const uniquePatientIds = [
      ...new Set(
        (appointmentsData || []).map((appt) => appt.patientId).filter(Boolean),
      ),
    ];
    if (uniquePatientIds.length === 0) {
      setDoctorPatients([]);
      return;
    }

    const patientProfiles = await Promise.all(
      uniquePatientIds.map(async (id) => {
        try {
          const patient = await patientService.getPatientById(id);
          return {
            id,
            firstName: patient.firstName || "Patient",
            lastName: patient.lastName || `#${id}`,
            email: patient.email || "",
            phone: patient.phone || "",
          };
        } catch {
          return {
            id,
            firstName: "Patient",
            lastName: `#${id}`,
            email: "",
            phone: "",
          };
        }
      }),
    );

    setDoctorPatients(patientProfiles);
  };

  const refreshAppointments = async (doctorId) => {
    const activeDoctorId = doctorId || doctorProfile?.id;
    if (!activeDoctorId) return;

    let apptsData = [];
    try {
      apptsData =
        await appointmentService.getAppointmentsByDoctorId(activeDoctorId);
    } catch {
      apptsData = [];
    }

    const sorted = (apptsData || []).sort(
      (a, b) =>
        getDateFromValue(a.appointmentDate) -
        getDateFromValue(b.appointmentDate),
    );
    setAppointments(sorted);
    await buildPatientCollection(sorted);
  };

  const refreshSchedules = async (doctorId) => {
    const activeDoctorId = doctorId || doctorProfile?.id;
    if (!activeDoctorId) return;
    const schedules = await doctorService.getDoctorSchedules(activeDoctorId);
    setDoctorSchedules(schedules || []);
  };

  const refreshTelemedicineSessions = async (doctorId) => {
    const activeDoctorId = doctorId || doctorProfile?.id;
    if (!activeDoctorId) return;
    const sessions =
      await doctorService.getTelemedicineSessions(activeDoctorId);
    setTelemedicineSessions(Array.isArray(sessions) ? sessions : []);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let docsData = null;
        let activeDoctorId = null;

        if (userEmail) {
          try {
            docsData = await doctorService.getDoctorByEmail(userEmail);
            activeDoctorId = docsData.id;
          } catch {
            console.warn(
              `User Email ${userEmail} not found in Doctor DB. Searching for fallback...`,
            );
          }
        } else if (userId) {
          try {
            docsData = await doctorService.getDoctorById(userId);
            activeDoctorId = docsData.id;
          } catch {
            console.warn(
              `User ID ${userId} not found in Doctor DB. Searching for fallback...`,
            );
          }
        }

        if (!docsData) {
          const allDocs = await doctorService.getAllDoctors();
          if (allDocs && allDocs.length > 0) {
            docsData = allDocs.find((d) => d.id === 3) || allDocs[0];
            activeDoctorId = docsData.id;
          }
        }

        let apptsData = [];
        if (activeDoctorId) {
          try {
            apptsData =
              await appointmentService.getAppointmentsByDoctorId(
                activeDoctorId,
              );
          } catch {
            console.error("No appointments found for doctor", activeDoctorId);
          }
        }

        const sortedAppointments = (apptsData || []).sort(
          (a, b) =>
            getDateFromValue(a.appointmentDate) -
            getDateFromValue(b.appointmentDate),
        );
        setDoctorProfile(docsData);
        setAppointments(sortedAppointments);
        await buildPatientCollection(sortedAppointments);
        if (docsData) {
          setProfileForm({
            email: docsData.email || "",
            phone: docsData.phone || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch doctor dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, userEmail]);

  useEffect(() => {
    const loadSectionData = async () => {
      if (!doctorProfile?.id) return;

      setSectionError("");
      setSectionMessage("");

      try {
        setSectionLoading(true);
        if (activeSection === "schedule") {
          await refreshSchedules(doctorProfile.id);
        }
        if (activeSection === "teleconferences") {
          await refreshTelemedicineSessions(doctorProfile.id);
        }
        if (activeSection === "history") {
          await refreshTelemedicineSessions(doctorProfile.id);
        }
      } catch (err) {
        setSectionError(
          err?.response?.data?.message || "Failed to load section data.",
        );
      } finally {
        setSectionLoading(false);
      }
    };

    loadSectionData();
  }, [activeSection, doctorProfile?.id]);

  const handleDecision = async (appointmentId, decision) => {
    if (!doctorProfile?.id) return;
    setSectionError("");
    setSectionMessage("");
    try {
      await doctorService.decideAppointment(
        doctorProfile.id,
        appointmentId,
        decision,
      );
      await refreshAppointments(doctorProfile.id);
      setSectionMessage(`Appointment #${appointmentId} marked as ${decision}.`);
    } catch (err) {
      setSectionError(
        err?.response?.data?.message ||
          "Failed to update appointment decision.",
      );
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    if (!doctorProfile?.id) return;
    setSectionError("");
    setSectionMessage("");
    try {
      await doctorService.createDoctorSchedule(doctorProfile.id, scheduleForm);
      setScheduleForm({ scheduleDate: "", startTime: "", endTime: "" });
      await refreshSchedules(doctorProfile.id);
      setSectionMessage("Schedule slot added.");
    } catch (err) {
      setSectionError(
        err?.response?.data?.message || "Failed to add schedule slot.",
      );
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!doctorProfile?.id) return;
    if (!window.confirm("Delete this schedule slot?")) return;
    setSectionError("");
    setSectionMessage("");
    try {
      await doctorService.deleteDoctorSchedule(doctorProfile.id, scheduleId);
      await refreshSchedules(doctorProfile.id);
      setSectionMessage("Schedule slot deleted.");
    } catch (err) {
      setSectionError(
        err?.response?.data?.message || "Failed to delete schedule slot.",
      );
    }
  };

  const handleSearchAppointments = () => {
    if (!doctorProfile?.id || !slotDate) return;
    setSectionError("");
    setSectionMessage("");
    try {
      const appsOnDate = appointments.filter((a) => {
        const appDateStr =
          typeof a.appointmentDate === "string"
            ? a.appointmentDate.split("T")[0]
            : Array.isArray(a.appointmentDate)
              ? `${a.appointmentDate[0]}-${String(a.appointmentDate[1]).padStart(2, "0")}-${String(a.appointmentDate[2]).padStart(2, "0")}`
              : null;
        return appDateStr === slotDate;
      });
      setSearchedAppointments(appsOnDate);
    } catch (err) {
      setSectionError("Failed to filter appointments.");
    }
  };

  const handleLoadReports = async (patientId) => {
    if (!doctorProfile?.id || !patientId) return;
    setSectionError("");
    setSectionMessage("");
    setSelectedPatientId(String(patientId));
    try {
      const reports = await doctorService.getPatientReports(
        doctorProfile.id,
        patientId,
      );
      setPatientReports(Array.isArray(reports) ? reports : []);
    } catch (err) {
      setSectionError(
        err?.response?.data?.message || "Failed to load patient reports.",
      );
      setPatientReports([]);
    }
  };

  const handleIssuePrescription = async (e) => {
    e.preventDefault();
    if (!doctorProfile?.id) return;
    setSectionError("");
    setSectionMessage("");

    if (!prescriptionForm.patientId) {
      setSectionError("Please select a patient before issuing a prescription.");
      return;
    }

    try {
      await doctorService.issuePrescription(
        doctorProfile.id,
        Number(prescriptionForm.patientId),
        {
          medicines: prescriptionForm.medicines,
          description: prescriptionForm.description,
        },
      );
      setSectionMessage("Prescription issued successfully.");
      setPrescriptionForm({
        patientId: "",
        medicines: [{ medicine: "", dosage: "" }],
        description: "",
      });
    } catch (err) {
      setSectionError(
        err?.response?.data?.message || "Failed to issue prescription.",
      );
    }
  };

  const handleJoinSession = async (sessionId) => {
    if (!doctorProfile?.id || !sessionId) return;
    setSectionError("");
    setSectionMessage("");
    try {
      await doctorService.joinTelemedicineSession(doctorProfile.id, sessionId);
      await refreshTelemedicineSessions(doctorProfile.id);
      setSectionMessage(`Joined teleconference session ${sessionId}.`);
    } catch (err) {
      setSectionError(
        err?.response?.data?.message ||
          "Failed to join teleconference session.",
      );
    }
  };

  const handleEndSession = async (sessionId) => {
    if (!doctorProfile?.id || !sessionId) return;
    setSectionError("");
    setSectionMessage("");
    try {
      await doctorService.endTelemedicineSession(doctorProfile.id, sessionId);
      await refreshTelemedicineSessions(doctorProfile.id);
      setSectionMessage(`Ended teleconference session ${sessionId}.`);
    } catch (err) {
      setSectionError(
        err?.response?.data?.message || "Failed to end teleconference session.",
      );
    }
  };

  const handleSaveProfile = async (field) => {
    if (!doctorProfile?.id) return;
    setSectionError("");
    setSectionMessage("");
    setProfileSaving(true);
    try {
      const payload = {
        name: doctorProfile.name,
        specialization: doctorProfile.specialization,
        email: field === "email" ? profileForm.email : doctorProfile.email,
        phone: field === "phone" ? profileForm.phone : doctorProfile.phone,
        availability: doctorProfile.availability,
        isAvailable: doctorProfile.isAvailable,
        isVerified: doctorProfile.isVerified,
      };
      const updated = await doctorService.updateDoctor(
        doctorProfile.id,
        payload,
      );
      setDoctorProfile(updated);
      setProfileForm({ email: updated.email, phone: updated.phone });
      setSectionMessage(
        field === "email"
          ? "Email updated successfully."
          : "Phone number updated successfully.",
      );
    } catch (err) {
      setSectionError(
        err?.response?.data?.message || "Failed to update profile.",
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const activeAppointments = appointments.filter(
    (a) =>
      a.status === "BOOKED" ||
      a.status === "PENDING" ||
      a.status === "ACCEPTED" ||
      a.status === "REJECTED",
  );
  const historyAppointments = appointments.filter(
    (a) => a.status === "ACCEPTED" || a.status === "REJECTED",
  );

  const todayAppointments = activeAppointments.filter((a) => {
    if (a.status === "REJECTED") return false;
    const appDateStr =
      typeof a.appointmentDate === "string"
        ? a.appointmentDate.split("T")[0]
        : Array.isArray(a.appointmentDate)
          ? `${a.appointmentDate[0]}-${String(a.appointmentDate[1]).padStart(2, "0")}-${String(a.appointmentDate[2]).padStart(2, "0")}`
          : null;
    const todayStr = new Date().toISOString().split("T")[0];
    return appDateStr === todayStr;
  });

  const headerTitle =
    activeSection === "schedule"
      ? `Good Morning, Dr. ${doctorProfile?.name?.replace(/^Dr\.\s*/i, "") || doctorProfile?.firstName || "Doctor"}`
      : activeSection === "patients"
        ? "My Patients"
        : activeSection === "teleconferences"
          ? "Teleconferences"
          : activeSection === "prescriptions"
            ? "Prescriptions"
            : activeSection === "profile"
              ? "My Profile"
              : "Consultation History";

  const headerSubtitle =
    activeSection === "schedule"
      ? `You have ${todayAppointments.length} consultations scheduled for today.`
      : activeSection === "patients"
        ? "Review patient reports connected to your appointments."
        : activeSection === "teleconferences"
          ? "Join or end your telemedicine sessions."
          : activeSection === "prescriptions"
            ? "Issue prescriptions for patients under your care."
            : activeSection === "profile"
              ? "View and update your contact information."
              : "Review completed, rejected, and cancelled consultations.";

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              background: "var(--accent-bg)",
              padding: "8px",
              borderRadius: "8px",
            }}
          >
            <Activity color="#3b82f6" size={24} />
          </div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "white" }}>
            Doctor Portal
          </h2>
        </div>

        <nav className="sidebar-nav">
          <div
            className={`nav-item ${activeSection === "schedule" ? "active" : ""}`}
            onClick={() => setActiveSection("schedule")}
          >
            <Calendar size={20} /> My Schedule
          </div>
          <div
            className={`nav-item ${activeSection === "patients" ? "active" : ""}`}
            onClick={() => setActiveSection("patients")}
          >
            <Users size={20} /> My Patients
          </div>
          <div
            className={`nav-item ${activeSection === "teleconferences" ? "active" : ""}`}
            onClick={() => setActiveSection("teleconferences")}
          >
            <Video size={20} /> Teleconferences
          </div>
          <div
            className={`nav-item ${activeSection === "prescriptions" ? "active" : ""}`}
            onClick={() => setActiveSection("prescriptions")}
          >
            <FileText size={20} /> Prescriptions
          </div>
          <div
            className={`nav-item ${activeSection === "history" ? "active" : ""}`}
            onClick={() => setActiveSection("history")}
          >
            <Clock size={20} /> Consult History
          </div>
          <div
            className={`nav-item ${activeSection === "profile" ? "active" : ""}`}
            onClick={() => setActiveSection("profile")}
          >
            <User size={20} /> My Profile
          </div>
        </nav>

        <div style={{ marginTop: "auto" }}>
          <div className="nav-item" onClick={() => navigate("/")}>
            <LogOut size={20} /> Sign Out
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div>
            <h1 className="text-h2">{headerTitle}</h1>
            <p style={{ color: "var(--text-secondary)" }}>{headerSubtitle}</p>
          </div>
          {activeSection === "schedule" && (
            <button
              className="btn-primary"
              style={{
                background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
              }}
            >
              Start Next Consultation <Video size={18} />
            </button>
          )}
          {activeSection === "teleconferences" && (
            <button
              className="btn-outline"
              onClick={() => refreshTelemedicineSessions(doctorProfile?.id)}
            >
              Refresh Sessions
            </button>
          )}
        </header>

        {sectionError &&
          (() => {
            const strError =
              typeof sectionError === "string"
                ? sectionError
                : JSON.stringify(sectionError);
            return (
              !strError.includes("You are not allowed to access") &&
              !strError.includes("sessions of another doctor")
            );
          })() && (
            <div
              className="glass-panel"
              style={{
                padding: "12px 14px",
                borderColor: "rgba(239, 68, 68, 0.4)",
                color: "#ef4444",
              }}
            >
              {typeof sectionError === "object"
                ? JSON.stringify(sectionError)
                : sectionError}
            </div>
          )}
        {sectionMessage && (
          <div
            className="glass-panel"
            style={{
              padding: "12px 14px",
              borderColor: "rgba(16, 185, 129, 0.4)",
              color: "#10b981",
            }}
          >
            {sectionMessage}
          </div>
        )}

        {sectionLoading && (
          <div style={{ color: "var(--text-secondary)" }}>
            Loading section data...
          </div>
        )}

        {!sectionLoading && activeSection === "schedule" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "24px",
            }}
          >
            <section
              className="glass-panel"
              style={{
                padding: "24px",
                minHeight: "400px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <h3 className="text-h3" style={{ marginBottom: "16px" }}>
                Upcoming Appointments
              </h3>
              {loading ? (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "var(--text-secondary)",
                  }}
                >
                  Loading appointments...
                </div>
              ) : activeAppointments.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(280px, 1fr)",
                    gap: "16px",
                    overflowY: "auto",
                    flex: 1,
                  }}
                >
                  {activeAppointments.map((app) => (
                    <div
                      key={app.id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <AppointmentCard appointment={app} role="DOCTOR" />
                      {(app.status === "PENDING" ||
                        app.status === "BOOKED") && (
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            className="btn-primary"
                            style={{
                              flex: 1,
                              padding: "8px 10px",
                              background:
                                "linear-gradient(to right, #10b981, #059669)",
                            }}
                            onClick={() => handleDecision(app.id, "ACCEPT")}
                          >
                            Accept
                          </button>
                          <button
                            className="btn-outline"
                            style={{
                              flex: 1,
                              borderColor: "rgba(239, 68, 68, 0.3)",
                              color: "#ef4444",
                            }}
                            onClick={() => handleDecision(app.id, "REJECT")}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flex: 1,
                    color: "var(--text-secondary)",
                    border: "1px dashed var(--glass-border)",
                    borderRadius: "8px",
                  }}
                >
                  No upcoming appointments.
                </div>
              )}
            </section>

            <section
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              <div className="glass-panel" style={{ padding: "24px" }}>
                <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                  My Patients
                </p>
                <h3
                  className="text-h1"
                  style={{ fontSize: "2.5rem", marginTop: "8px" }}
                >
                  {doctorPatients.length}
                </h3>
              </div>

              <div className="glass-panel" style={{ padding: "20px" }}>
                <h3
                  className="text-h3"
                  style={{ marginBottom: "12px", fontSize: "1.2rem" }}
                >
                  Add Availability Slot
                </h3>
                <form
                  onSubmit={handleCreateSchedule}
                  style={{ display: "grid", gap: "10px" }}
                >
                  <input
                    type="date"
                    className="glass-input"
                    value={scheduleForm.scheduleDate}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        scheduleDate: e.target.value,
                      }))
                    }
                    required
                  />
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px",
                    }}
                  >
                    <input
                      type="time"
                      className="glass-input"
                      value={scheduleForm.startTime}
                      onChange={(e) =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          startTime: e.target.value,
                        }))
                      }
                      required
                    />
                    <input
                      type="time"
                      className="glass-input"
                      value={scheduleForm.endTime}
                      onChange={(e) =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          endTime: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <button
                    className="btn-primary"
                    type="submit"
                    style={{ padding: "8px 10px" }}
                  >
                    Save Slot
                  </button>
                </form>

                <div
                  style={{
                    marginTop: "14px",
                    maxHeight: "160px",
                    overflowY: "auto",
                    display: "grid",
                    gap: "8px",
                  }}
                >
                  {doctorSchedules.slice(0, 6).map((slot) => (
                    <div
                      key={slot.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "8px",
                        alignItems: "center",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        background: "rgba(255, 255, 255, 0.03)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {formatDate(slot.scheduleDate)}{" "}
                        {formatTime(slot.startTime)} -{" "}
                        {formatTime(slot.endTime)}
                      </span>
                      <button
                        className="btn-outline"
                        style={{
                          padding: "5px 9px",
                          fontSize: "0.78rem",
                          borderColor: "rgba(239, 68, 68, 0.3)",
                          color: "#ef4444",
                        }}
                        onClick={() => handleDeleteSchedule(slot.id)}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                  {doctorSchedules.length === 0 && (
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.85rem",
                      }}
                    >
                      No schedule slots yet.
                    </p>
                  )}
                </div>
              </div>

              <div className="glass-panel" style={{ padding: "20px" }}>
                <h3
                  className="text-h3"
                  style={{ marginBottom: "12px", fontSize: "1.2rem" }}
                >
                  Search Appointments by Date
                </h3>
                <div
                  style={{ display: "flex", gap: "10px", marginBottom: "10px" }}
                >
                  <input
                    type="date"
                    className="glass-input"
                    value={slotDate}
                    onChange={(e) => setSlotDate(e.target.value)}
                  />
                  <button
                    className="btn-outline"
                    onClick={handleSearchAppointments}
                  >
                    Load
                  </button>
                </div>
                <div
                  style={{
                    maxHeight: "200px",
                    overflowY: "auto",
                    display: "grid",
                    gap: "10px",
                  }}
                >
                  {searchedAppointments.map((app) => {
                    const timeStr =
                      typeof app.appointmentDate === "string"
                        ? new Date(app.appointmentDate).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : Array.isArray(app.appointmentDate)
                          ? `${String(app.appointmentDate[3]).padStart(2, "0")}:${String(app.appointmentDate[4]).padStart(2, "0")}`
                          : "";

                    const patient = doctorPatients.find(
                      (p) => p.id === app.patientId,
                    );
                    const patientName = patient
                      ? `${patient.firstName} ${patient.lastName}`
                      : `Patient #${app.patientId}`;

                    return (
                      <div
                        key={app.id}
                        className="glass-panel"
                        style={{
                          padding: "10px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                            {patientName}
                          </p>
                          <span
                            style={{
                              color: "var(--text-secondary)",
                              fontSize: "0.8rem",
                            }}
                          >
                            {timeStr} • Status: {app.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {searchedAppointments.length === 0 && (
                    <span
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.85rem",
                      }}
                    >
                      No appointments found for this date.
                    </span>
                  )}
                </div>
              </div>

              <div className="glass-panel" style={{ padding: "24px", flex: 1 }}>
                <h3 className="text-h3" style={{ marginBottom: "16px" }}>
                  Quick Actions
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <button
                    className="btn-outline"
                    style={{
                      justifyContent: "flex-start",
                      display: "flex",
                      gap: "8px",
                    }}
                    onClick={() => setActiveSection("prescriptions")}
                  >
                    <FileText size={16} /> Write Prescription
                  </button>
                  <button
                    className="btn-outline"
                    style={{
                      justifyContent: "flex-start",
                      display: "flex",
                      gap: "8px",
                    }}
                    onClick={() => setActiveSection("history")}
                  >
                    <Calendar size={16} /> Consult History
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {!sectionLoading && activeSection === "patients" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: "24px",
            }}
          >
            <section className="glass-panel" style={{ padding: "20px" }}>
              <h3 className="text-h3" style={{ marginBottom: "14px" }}>
                Patients from My Appointments
              </h3>
              <div style={{ display: "grid", gap: "12px" }}>
                {doctorPatients.map((patient) => (
                  <div
                    key={patient.id}
                    style={{
                      border: "1px solid var(--glass-border)",
                      borderRadius: "10px",
                      padding: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: 600 }}>
                        {patient.firstName} {patient.lastName}
                      </p>
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.85rem",
                        }}
                      >
                        {patient.email || `Patient #${patient.id}`}
                      </p>
                    </div>
                    <button
                      className="btn-outline"
                      onClick={() => handleLoadReports(patient.id)}
                    >
                      Load Reports
                    </button>
                  </div>
                ))}
                {doctorPatients.length === 0 && (
                  <p style={{ color: "var(--text-secondary)" }}>
                    No patients mapped from appointments yet.
                  </p>
                )}
              </div>
            </section>

            <section className="glass-panel" style={{ padding: "20px" }}>
              <h3 className="text-h3" style={{ marginBottom: "14px" }}>
                {selectedPatientId
                  ? `Reports for Patient #${selectedPatientId}`
                  : "Patient Reports"}
              </h3>
              {patientReports.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gap: "10px",
                    maxHeight: "420px",
                    overflowY: "auto",
                  }}
                >
                  {patientReports.map((report, index) => (
                    <div
                      key={`report-${index}`}
                      style={{
                        padding: "10px",
                        borderRadius: "8px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid var(--glass-border)",
                      }}
                    >
                      {Object.entries(report).map(([key, value]) => (
                        <p
                          key={key}
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.85rem",
                            marginBottom: "4px",
                          }}
                        >
                          <span
                            style={{
                              color: "var(--text-primary)",
                              fontWeight: 600,
                            }}
                          >
                            {key}:
                          </span>{" "}
                          {String(value)}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "var(--text-secondary)" }}>
                  Select a patient and load reports.
                </p>
              )}
            </section>
          </div>
        )}

        {!sectionLoading && activeSection === "prescriptions" && (
          <section
            className="glass-panel"
            style={{ padding: "24px", maxWidth: "760px" }}
          >
            <h3 className="text-h3" style={{ marginBottom: "16px" }}>
              Issue Prescription
            </h3>
            <form
              onSubmit={handleIssuePrescription}
              style={{ display: "grid", gap: "12px" }}
            >
              <select
                className="glass-input"
                value={prescriptionForm.patientId}
                onChange={(e) =>
                  setPrescriptionForm((prev) => ({
                    ...prev,
                    patientId: e.target.value,
                  }))
                }
                required
              >
                <option value="" style={{ color: "#333" }}>
                  Select Patient
                </option>
                {doctorPatients.map((patient) => (
                  <option
                    key={patient.id}
                    value={patient.id}
                    style={{ color: "#333" }}
                  >
                    {patient.firstName} {patient.lastName} (#{patient.id})
                  </option>
                ))}
              </select>

              <div
                style={{
                  display: "grid",
                  gap: "12px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  padding: "16px",
                  borderRadius: "8px",
                }}
              >
                <h4
                  style={{
                    margin: 0,
                    fontSize: "1rem",
                    color: "var(--text-primary)",
                  }}
                >
                  Medicines
                </h4>
                {prescriptionForm.medicines.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "flex-start",
                    }}
                  >
                    <input
                      className="glass-input"
                      placeholder="Medicine"
                      value={item.medicine}
                      onChange={(e) => {
                        const newMedicines = [...prescriptionForm.medicines];
                        newMedicines[index].medicine = e.target.value;
                        setPrescriptionForm((prev) => ({
                          ...prev,
                          medicines: newMedicines,
                        }));
                      }}
                      required
                      style={{ flex: 1 }}
                    />
                    <input
                      className="glass-input"
                      placeholder="Dosage"
                      value={item.dosage}
                      onChange={(e) => {
                        const newMedicines = [...prescriptionForm.medicines];
                        newMedicines[index].dosage = e.target.value;
                        setPrescriptionForm((prev) => ({
                          ...prev,
                          medicines: newMedicines,
                        }));
                      }}
                      required
                      style={{ flex: 1 }}
                    />
                    {prescriptionForm.medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newMedicines =
                            prescriptionForm.medicines.filter(
                              (_, i) => i !== index,
                            );
                          setPrescriptionForm((prev) => ({
                            ...prev,
                            medicines: newMedicines,
                          }));
                        }}
                        style={{
                          padding: "10px",
                          background: "rgba(239, 68, 68, 0.1)",
                          color: "#ef4444",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setPrescriptionForm((prev) => ({
                      ...prev,
                      medicines: [
                        ...prev.medicines,
                        { medicine: "", dosage: "" },
                      ],
                    }));
                  }}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px dashed rgba(255,255,255,0.2)",
                    padding: "8px",
                    borderRadius: "8px",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  + Add Another Medicine
                </button>
              </div>

              <textarea
                className="glass-input"
                placeholder="Description / Notes (Optional)"
                value={prescriptionForm.description}
                onChange={(e) =>
                  setPrescriptionForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                style={{ resize: "vertical", minHeight: "80px" }}
              />

              <div>
                <button
                  className="btn-primary"
                  type="submit"
                  style={{
                    background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
                  }}
                >
                  <FileText size={16} /> Submit Prescription
                </button>
              </div>
            </form>
          </section>
        )}

        {!sectionLoading && activeSection === "teleconferences" && (
          <section style={{ display: "grid", gap: "14px" }}>
            {telemedicineSessions.map((session, index) => {
              const sessionId =
                session.sessionId || session.id || session.session_id;
              const status = session.status || session.state || "UNKNOWN";
              return (
                <div
                  key={`${sessionId || "session"}-${index}`}
                  className="glass-panel"
                  style={{ padding: "18px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: "1.05rem", marginBottom: "6px" }}>
                        Session #{sessionId || "N/A"}
                      </h4>
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.88rem",
                        }}
                      >
                        Status: {status}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        className="btn-primary"
                        style={{ padding: "8px 12px" }}
                        onClick={() => handleJoinSession(sessionId)}
                        disabled={!sessionId}
                      >
                        Join
                      </button>
                      <button
                        className="btn-outline"
                        style={{ padding: "8px 12px" }}
                        onClick={() => handleEndSession(sessionId)}
                        disabled={!sessionId}
                      >
                        End
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {telemedicineSessions.length === 0 && (
              <div
                className="glass-panel"
                style={{
                  padding: "22px",
                  color: "var(--text-secondary)",
                  textAlign: "center",
                }}
              >
                No teleconference sessions found.
              </div>
            )}
          </section>
        )}

        {!sectionLoading && activeSection === "history" && (
          <section style={{ display: "grid", gap: "20px" }}>
            {/* Sub-tab bar */}
            <div
              style={{
                display: "flex",
                gap: "4px",
                borderBottom: "1px solid var(--glass-border)",
                paddingBottom: "0",
              }}
            >
              {[
                { key: "appointments", label: "Appointments" },
                { key: "telemedicine", label: "Telemedicine" },
                { key: "prescriptions", label: "Prescriptions" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setHistoryTab(tab.key);
                    if (
                      tab.key === "prescriptions" &&
                      doctorPrescriptions.length === 0
                    ) {
                      setPrescriptionsLoading(true);
                      Promise.all(
                        doctorPatients.map((p) =>
                          doctorService.getPrescriptionsForPatient(
                            doctorProfile?.id,
                            p.id,
                          ),
                        ),
                      )
                        .then((results) => {
                          setDoctorPrescriptions(results.flat());
                        })
                        .finally(() => setPrescriptionsLoading(false));
                    }
                  }}
                  style={{
                    padding: "10px 20px",
                    background: "transparent",
                    border: "none",
                    borderBottom:
                      historyTab === tab.key
                        ? "2px solid #3b82f6"
                        : "2px solid transparent",
                    color:
                      historyTab === tab.key
                        ? "var(--text-primary)"
                        : "var(--text-secondary)",
                    fontWeight: historyTab === tab.key ? 600 : 400,
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    transition: "all 0.2s ease",
                    marginBottom: "-1px",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Appointments Tab ── */}
            {historyTab === "appointments" && (
              <div style={{ display: "grid", gap: "12px" }}>
                {historyAppointments.length > 0 ? (
                  historyAppointments.map((appt) => {
                    const isAccepted = appt.status === "ACCEPTED";
                    const patient = doctorPatients.find(
                      (p) => p.id === appt.patientId,
                    );
                    const patientName = patient
                      ? `${patient.firstName} ${patient.lastName}`
                      : `Patient #${appt.patientId}`;
                    return (
                      <div
                        key={appt.id}
                        className="glass-panel"
                        style={{
                          padding: "18px 22px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "16px",
                          borderLeft: `3px solid ${
                            isAccepted ? "#10b981" : "#ef4444"
                          }`,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                          }}
                        >
                          <span style={{ fontWeight: 600, fontSize: "1rem" }}>
                            {patientName}
                          </span>
                          <span
                            style={{
                              color: "var(--text-secondary)",
                              fontSize: "0.85rem",
                            }}
                          >
                            {formatDate(appt.appointmentDate)}
                            {appt.startTime
                              ? ` • ${formatTime(appt.startTime)}`
                              : ""}
                          </span>
                          {appt.reason && (
                            <span
                              style={{
                                color: "var(--text-secondary)",
                                fontSize: "0.82rem",
                                fontStyle: "italic",
                              }}
                            >
                              {appt.reason}
                            </span>
                          )}
                        </div>
                        <span
                          style={{
                            padding: "5px 14px",
                            borderRadius: "999px",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            background: isAccepted
                              ? "rgba(16,185,129,0.15)"
                              : "rgba(239,68,68,0.15)",
                            color: isAccepted ? "#10b981" : "#ef4444",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {appt.status}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div
                    className="glass-panel"
                    style={{
                      padding: "32px",
                      color: "var(--text-secondary)",
                      textAlign: "center",
                    }}
                  >
                    No accepted or rejected appointments yet.
                  </div>
                )}
              </div>
            )}

            {/* ── Telemedicine Tab ── */}
            {historyTab === "telemedicine" && (
              <div style={{ display: "grid", gap: "14px" }}>
                {telemedicineSessions.length > 0 ? (
                  telemedicineSessions.map((session, index) => {
                    const sessionId =
                      session.sessionId || session.id || session.session_id;
                    const status = session.status || session.state || "UNKNOWN";
                    const patientId = session.patientId || session.patient_id;
                    const patient = doctorPatients.find(
                      (p) => p.id === patientId,
                    );
                    const patientName = patient
                      ? `${patient.firstName} ${patient.lastName}`
                      : patientId
                        ? `Patient #${patientId}`
                        : null;
                    const isActive =
                      status === "ACTIVE" || status === "IN_PROGRESS";
                    return (
                      <div
                        key={`${sessionId || "session"}-${index}`}
                        className="glass-panel"
                        style={{
                          padding: "20px 22px",
                          borderLeft: `3px solid ${
                            isActive ? "#3b82f6" : "rgba(255,255,255,0.15)"
                          }`,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "12px",
                            flexWrap: "wrap",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "4px",
                            }}
                          >
                            <h4 style={{ fontSize: "1rem", margin: 0 }}>
                              Session #{sessionId || "N/A"}
                            </h4>
                            {patientName && (
                              <span
                                style={{
                                  color: "var(--text-secondary)",
                                  fontSize: "0.85rem",
                                }}
                              >
                                Patient: {patientName}
                              </span>
                            )}
                            {session.createdAt && (
                              <span
                                style={{
                                  color: "var(--text-secondary)",
                                  fontSize: "0.82rem",
                                }}
                              >
                                {formatDate(session.createdAt)}
                              </span>
                            )}
                          </div>
                          <span
                            style={{
                              padding: "5px 14px",
                              borderRadius: "999px",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              background: isActive
                                ? "rgba(59,130,246,0.15)"
                                : "rgba(255,255,255,0.07)",
                              color: isActive
                                ? "#3b82f6"
                                : "var(--text-secondary)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div
                    className="glass-panel"
                    style={{
                      padding: "32px",
                      color: "var(--text-secondary)",
                      textAlign: "center",
                    }}
                  >
                    No telemedicine sessions conducted yet.
                  </div>
                )}
              </div>
            )}

            {/* ── Prescriptions Tab ── */}
            {historyTab === "prescriptions" && (
              <div>
                {prescriptionsLoading ? (
                  <div
                    style={{ color: "var(--text-secondary)", padding: "12px" }}
                  >
                    Loading prescriptions...
                  </div>
                ) : doctorPrescriptions.length > 0 ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(300px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    {doctorPrescriptions.map((rx, idx) => {
                      const patient = doctorPatients.find(
                        (p) => p.id === rx.patientId,
                      );
                      const patientName = patient
                        ? `${patient.firstName} ${patient.lastName}`
                        : `Patient #${rx.patientId}`;
                      const medicines = Array.isArray(rx.medicines)
                        ? rx.medicines
                        : [];
                      return (
                        <div
                          key={rx.id || idx}
                          className="glass-panel"
                          style={{
                            padding: "20px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                            borderTop: "3px solid #8b5cf6",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                            }}
                          >
                            <div>
                              <p
                                style={{
                                  fontWeight: 700,
                                  fontSize: "0.95rem",
                                  marginBottom: "2px",
                                }}
                              >
                                {patientName}
                              </p>
                              {rx.issuedAt || rx.createdAt ? (
                                <p
                                  style={{
                                    color: "var(--text-secondary)",
                                    fontSize: "0.78rem",
                                  }}
                                >
                                  {formatDate(rx.issuedAt || rx.createdAt)}
                                </p>
                              ) : null}
                            </div>
                            <span
                              style={{
                                background: "rgba(139,92,246,0.15)",
                                color: "#a78bfa",
                                borderRadius: "999px",
                                padding: "3px 10px",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                              }}
                            >
                              Rx #{rx.id || idx + 1}
                            </span>
                          </div>

                          {medicines.length > 0 && (
                            <div
                              style={{
                                background: "rgba(255,255,255,0.04)",
                                borderRadius: "8px",
                                padding: "10px 12px",
                                display: "grid",
                                gap: "6px",
                              }}
                            >
                              <p
                                style={{
                                  fontSize: "0.78rem",
                                  color: "var(--text-secondary)",
                                  fontWeight: 600,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                  marginBottom: "4px",
                                }}
                              >
                                Medicines
                              </p>
                              {medicines.map((med, i) => (
                                <div
                                  key={i}
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontSize: "0.88rem",
                                  }}
                                >
                                  <span>{med.medicine || med.name || med}</span>
                                  {med.dosage && (
                                    <span
                                      style={{
                                        color: "var(--text-secondary)",
                                      }}
                                    >
                                      {med.dosage}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {rx.description && (
                            <p
                              style={{
                                color: "var(--text-secondary)",
                                fontSize: "0.85rem",
                                fontStyle: "italic",
                                borderTop: "1px solid var(--glass-border)",
                                paddingTop: "8px",
                                margin: 0,
                              }}
                            >
                              {rx.description}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    className="glass-panel"
                    style={{
                      padding: "32px",
                      color: "var(--text-secondary)",
                      textAlign: "center",
                    }}
                  >
                    No prescriptions issued yet.
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {!sectionLoading && activeSection === "profile" && (
          <section
            style={{
              display: "grid",
              gap: "24px",
              maxWidth: "680px",
            }}
          >
            {/* Avatar + Name card */}
            <div
              className="glass-panel"
              style={{
                padding: "28px 24px",
                display: "flex",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <User size={32} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <h2
                  style={{
                    fontSize: "1.35rem",
                    fontWeight: 700,
                    marginBottom: "4px",
                  }}
                >
                  {doctorProfile?.name || "—"}
                </h2>
                <p
                  style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}
                >
                  {doctorProfile?.specialization || "—"}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "3px 12px",
                      borderRadius: "999px",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      background: doctorProfile?.isVerified
                        ? "rgba(16,185,129,0.15)"
                        : "rgba(245,158,11,0.15)",
                      color: doctorProfile?.isVerified ? "#10b981" : "#f59e0b",
                    }}
                  >
                    <Shield size={12} />
                    {doctorProfile?.isVerified
                      ? "Verified"
                      : "Pending Verification"}
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "3px 12px",
                      borderRadius: "999px",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      background: doctorProfile?.isAvailable
                        ? "rgba(59,130,246,0.15)"
                        : "rgba(100,116,139,0.15)",
                      color: doctorProfile?.isAvailable ? "#3b82f6" : "#94a3b8",
                    }}
                  >
                    <CheckCircle size={12} />
                    {doctorProfile?.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>
            </div>

            {/* Editable fields */}
            <div className="glass-panel" style={{ padding: "24px" }}>
              <h3
                className="text-h3"
                style={{ marginBottom: "20px", fontSize: "1.05rem" }}
              >
                Contact Information
              </h3>

              {/* Email row */}
              <div
                style={{ display: "grid", gap: "6px", marginBottom: "20px" }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  <Mail size={14} /> Email Address
                </label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="email"
                    className="glass-input"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    style={{ flex: 1 }}
                  />
                  <button
                    className="btn-primary"
                    style={{
                      padding: "0 20px",
                      background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
                      whiteSpace: "nowrap",
                      opacity: profileSaving ? 0.7 : 1,
                    }}
                    disabled={
                      profileSaving ||
                      profileForm.email === doctorProfile?.email
                    }
                    onClick={() => handleSaveProfile("email")}
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Phone row */}
              <div style={{ display: "grid", gap: "6px" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  <Phone size={14} /> Mobile Number
                </label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="tel"
                    className="glass-input"
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    style={{ flex: 1 }}
                  />
                  <button
                    className="btn-primary"
                    style={{
                      padding: "0 20px",
                      background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
                      whiteSpace: "nowrap",
                      opacity: profileSaving ? 0.7 : 1,
                    }}
                    disabled={
                      profileSaving ||
                      profileForm.phone === doctorProfile?.phone
                    }
                    onClick={() => handleSaveProfile("phone")}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>

            {/* Read-only info */}
            <div className="glass-panel" style={{ padding: "20px 24px" }}>
              <h3
                className="text-h3"
                style={{ marginBottom: "16px", fontSize: "1.05rem" }}
              >
                Account Details
              </h3>
              <div style={{ display: "grid", gap: "10px" }}>
                {[
                  { label: "Doctor ID", value: doctorProfile?.id },
                  { label: "Full Name", value: doctorProfile?.name },
                  {
                    label: "Specialization",
                    value: doctorProfile?.specialization,
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      borderBottom: "1px solid var(--glass-border)",
                      fontSize: "0.9rem",
                    }}
                  >
                    <span
                      style={{
                        color: "var(--text-secondary)",
                        fontWeight: 500,
                      }}
                    >
                      {label}
                    </span>
                    <span style={{ fontWeight: 600 }}>{value || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
