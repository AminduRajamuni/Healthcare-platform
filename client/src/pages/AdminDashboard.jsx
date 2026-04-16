import React, { useState, useEffect } from "react";
import {
  Users,
  Activity,
  Calendar as CalendarIcon,
  CreditCard,
  Video,
  Settings,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import appointmentService from "../services/appointmentService";
import doctorService from "../services/doctorService";
import patientService from "../services/patientService";
import adminService from "../services/adminService";
import paymentService from "../services/paymentService";
import AppointmentCard from "../components/AppointmentCard";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  // For "All Appointments" sub tabs
  const [appCategory, setAppCategory] = useState("BOOKED");

  // For users & roles
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [userTab, setUserTab] = useState("DOCTORS");
  const [stats, setStats] = useState({
    totalUsers: "-",
    totalDoctors: "-",
    totalAppointments: "-",
    totalPayments: "-",
  });
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("ALL");

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [apptsData, docsData, patsData, statsData] = await Promise.all([
          appointmentService.getAllAppointments(),
          doctorService.getAllDoctors(),
          patientService.getAllPatients(),
          adminService.getPlatformStats(),
        ]);

        // Sort descending by date
        const sorted = apptsData.sort(
          (a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate),
        );
        setAppointments(sorted || []);
        setDoctors(docsData || []);
        setPatients(patsData || []);
        if (statsData) setStats(statsData);
      } catch (err) {
        console.error("Failed to fetch dashboard core data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (activeTab !== "Payments") {
      return;
    }

    const fetchPayments = async () => {
      setPaymentsLoading(true);
      setPaymentsError("");
      try {
        const data = await paymentService.getAllPayments();
        const sorted = (data || []).sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt) -
            new Date(a.updatedAt || a.createdAt),
        );
        setPayments(sorted);
      } catch (err) {
        console.error("Failed to fetch payments", err);
        setPaymentsError("Unable to load payments right now.");
      } finally {
        setPaymentsLoading(false);
      }
    };

    fetchPayments();
  }, [activeTab]);

  const handleCancel = async (appointment) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this appointment as Admin?",
      )
    )
      return;
    try {
      await appointmentService.cancelAppointment(appointment.id);
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === appointment.id ? { ...a, status: "CANCELLED" } : a,
        ),
      );
    } catch {
      alert("Failed to cancel appointment");
    }
  };

  const handleHardDelete = async (appointment) => {
    if (
      !window.confirm(
        "WARNING: This will permanently delete the appointment record. Continue?",
      )
    )
      return;
    try {
      await appointmentService.hardDeleteAppointment(appointment.id);
      setAppointments((prev) => prev.filter((a) => a.id !== appointment.id));
    } catch {
      alert("Failed to delete appointment permanently");
    }
  };

  const handleVerifyDoctor = async (id) => {
    try {
      const verified = await doctorService.verifyDoctor(id);
      setDoctors((prev) => prev.map((d) => (d.id === id ? verified : d)));
    } catch {
      alert("Failed to verify doctor");
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm("Delete this doctor?")) return;
    try {
      await doctorService.deleteDoctor(id);
      setDoctors((prev) => prev.filter((d) => d.id !== id));
    } catch {
      alert("Failed to delete doctor");
    }
  };

  const handleDeletePatient = async (id) => {
    if (!window.confirm("Delete this patient account?")) return;
    try {
      await patientService.deletePatient(id);
      setPatients((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Failed to delete patient");
    }
  };

  const handleCancelPayment = async (orderId) => {
    if (!orderId) return;
    if (!window.confirm("Cancel this pending payment?")) return;

    try {
      const updated = await paymentService.cancelPaymentByOrderId(orderId);
      setPayments((prev) =>
        prev.map((payment) =>
          payment.orderId === orderId ? updated : payment,
        ),
      );
    } catch (err) {
      console.error("Failed to cancel payment order", err);
      alert("Failed to cancel pending payment.");
    }
  };

  const recentAppointments = appointments.slice(0, 4);

  const filteredAppointments = appointments.filter((a) => {
    if (appCategory === "ALL") return true;
    return a.status === appCategory;
  });

  const filteredPayments = payments.filter((payment) => {
    if (paymentStatusFilter === "ALL") return true;
    return payment.status === paymentStatusFilter;
  });

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              background: "var(--accent-bg)",
              padding: "8px",
              borderRadius: "8px",
            }}
          >
            <Activity color="var(--gradient-1)" size={24} />
          </div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "white" }}>
            Admin Portal
          </h2>
        </div>

        <nav className="sidebar-nav">
          <div
            className={`nav-item ${activeTab === "Overview" ? "active" : ""}`}
            onClick={() => setActiveTab("Overview")}
          >
            <Activity size={20} /> Overview
          </div>
          <div
            className={`nav-item ${activeTab === "Users & Roles" ? "active" : ""}`}
            onClick={() => setActiveTab("Users & Roles")}
          >
            <Users size={20} /> Users & Roles
          </div>
          <div
            className={`nav-item ${activeTab === "All Appointments" ? "active" : ""}`}
            onClick={() => setActiveTab("All Appointments")}
          >
            <CalendarIcon size={20} /> All Appointments
          </div>
          <div
            className={`nav-item ${activeTab === "Payments" ? "active" : ""}`}
            onClick={() => setActiveTab("Payments")}
          >
            <CreditCard size={20} /> Payments
          </div>
          <div className="nav-item">
            <Video size={20} /> Telemedicine Logs
          </div>
          <div className="nav-item">
            <Settings size={20} /> System Settings
          </div>
        </nav>

        <div style={{ marginTop: "auto" }}>
          <div className="nav-item" onClick={() => navigate("/")}>
            <LogOut size={20} /> Sign Out
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content" style={{ overflowY: "auto" }}>
        <header className="header">
          <div>
            <h1 className="text-h2">
              {activeTab === "Overview" ? "Welcome back, Admin" : activeTab}
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>
              {activeTab === "Overview"
                ? "Here's what's happening across the platform today."
                : "Manage and track all platform records."}
            </p>
          </div>
          <button className="btn-primary">Generate Report</button>
        </header>

        {activeTab === "Overview" && (
          <>
            {/* Dummy Metrics */}
            <section className="card-grid">
              {[
                { title: "Total Users", value: stats.totalUsers, change: "" },
                {
                  title: "Total Doctors",
                  value: stats.totalDoctors,
                  change: "",
                },
                {
                  title: "Total Appointments",
                  value: stats.totalAppointments,
                  change: "",
                },
                {
                  title: "Total Payments",
                  value: stats.totalPayments,
                  change: "",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="glass-panel"
                  style={{ padding: "24px" }}
                >
                  <p
                    style={{ color: "var(--text-secondary)", fontWeight: 500 }}
                  >
                    {stat.title}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "12px",
                      marginTop: "8px",
                    }}
                  >
                    <h3 className="text-h1" style={{ fontSize: "2.5rem" }}>
                      {stat.value}
                    </h3>
                    <span style={{ color: "#34d399", fontWeight: 500 }}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              ))}
            </section>

            {/* Recent Activity -> Recent Appointments */}
            <section
              style={{
                flex: 1,
                minHeight: "300px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <h3 className="text-h3">
                  Recent System Activity (Appointments)
                </h3>
                <button
                  className="btn-outline"
                  onClick={() => setActiveTab("All Appointments")}
                  style={{ padding: "8px 16px", fontSize: "0.9rem" }}
                >
                  View All
                </button>
              </div>

              {loading ? (
                <div style={{ color: "var(--text-secondary)" }}>
                  Loading recent activities...
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(350px, 1fr))",
                    gap: "24px",
                  }}
                >
                  {recentAppointments.length > 0 ? (
                    recentAppointments.map((app) => (
                      <AppointmentCard
                        key={app.id}
                        appointment={app}
                        onCancel={handleCancel}
                        onHardDelete={handleHardDelete}
                        role="ADMIN"
                      />
                    ))
                  ) : (
                    <div style={{ color: "var(--text-secondary)" }}>
                      No recent activity records.
                    </div>
                  )}
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === "All Appointments" && (
          <section
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            {/* Dynamic Filter Tabs */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                borderBottom: "1px solid var(--glass-border)",
                paddingBottom: "12px",
              }}
            >
              {["ALL", "BOOKED", "CANCELLED", "COMPLETED"].map((status) => (
                <button
                  key={status}
                  onClick={() => setAppCategory(status)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color:
                      appCategory === status
                        ? "var(--gradient-1)"
                        : "var(--text-secondary)",
                    fontWeight: appCategory === status ? 600 : 400,
                    padding: "8px 16px",
                    cursor: "pointer",
                    borderBottom:
                      appCategory === status
                        ? "2px solid var(--gradient-1)"
                        : "2px solid transparent",
                    transition: "all 0.2s",
                  }}
                >
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ color: "var(--text-secondary)" }}>
                Loading all appointments data...
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                  gap: "24px",
                }}
              >
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((app) => (
                    <AppointmentCard
                      key={app.id}
                      appointment={app}
                      onCancel={handleCancel}
                      onHardDelete={handleHardDelete}
                      role="ADMIN"
                    />
                  ))
                ) : (
                  <div
                    style={{
                      padding: "24px",
                      background: "var(--glass-bg)",
                      borderRadius: "12px",
                      textAlign: "center",
                      color: "var(--text-secondary)",
                    }}
                  >
                    No appointments found for category:{" "}
                    {appCategory.toLowerCase()}.
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {activeTab === "Users & Roles" && (
          <section
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            <div
              style={{
                display: "flex",
                gap: "12px",
                borderBottom: "1px solid var(--glass-border)",
                paddingBottom: "12px",
              }}
            >
              {["DOCTORS", "PATIENTS"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setUserTab(tab)}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color:
                      userTab === tab
                        ? "var(--gradient-1)"
                        : "var(--text-secondary)",
                    fontWeight: userTab === tab ? 600 : 400,
                    padding: "8px 16px",
                    borderBottom:
                      userTab === tab
                        ? "2px solid var(--gradient-1)"
                        : "2px solid transparent",
                    transition: "all 0.2s",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {userTab === "DOCTORS" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "24px",
                }}
              >
                {doctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="glass-panel"
                    style={{
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
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
                        <h4
                          className="text-h3"
                          style={{ fontSize: "1.2rem", marginBottom: "4px" }}
                        >
                          {doc.name || `${doc.firstName} ${doc.lastName}`}
                        </h4>
                        <p
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.9rem",
                          }}
                        >
                          {doc.specialization}
                        </p>
                        <p
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.85rem",
                          }}
                        >
                          {doc.email}
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontWeight: 600,
                          background: doc.isVerified
                            ? "rgba(16, 185, 129, 0.1)"
                            : "rgba(245, 158, 11, 0.1)",
                          color: doc.isVerified ? "#10b981" : "#f59e0b",
                        }}
                      >
                        {doc.isVerified ? "Verified" : "Pending"}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        marginTop: "auto",
                        paddingTop: "12px",
                      }}
                    >
                      {!doc.isVerified && (
                        <button
                          className="btn-primary"
                          style={{
                            flex: 1,
                            padding: "8px",
                            fontSize: "0.9rem",
                          }}
                          onClick={() => handleVerifyDoctor(doc.id)}
                        >
                          Verify
                        </button>
                      )}
                      <button
                        className="btn-outline"
                        style={{
                          flex: 1,
                          padding: "8px",
                          fontSize: "0.9rem",
                          borderColor: "rgba(239, 68, 68, 0.3)",
                          color: "#ef4444",
                        }}
                        onClick={() => handleDeleteDoctor(doc.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {userTab === "PATIENTS" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "24px",
                }}
              >
                {patients.map((pat) => (
                  <div
                    key={pat.id}
                    className="glass-panel"
                    style={{
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <h4
                          className="text-h3"
                          style={{ fontSize: "1.2rem", marginBottom: "4px" }}
                        >
                          {pat.firstName} {pat.lastName}
                        </h4>
                        <p
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.85rem",
                          }}
                        >
                          {pat.email}
                        </p>
                        <p
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.85rem",
                          }}
                        >
                          {pat.phone}
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        marginTop: "auto",
                        paddingTop: "12px",
                      }}
                    >
                      <button
                        className="btn-outline"
                        style={{
                          flex: 1,
                          padding: "8px",
                          fontSize: "0.9rem",
                          borderColor: "rgba(239, 68, 68, 0.3)",
                          color: "#ef4444",
                        }}
                        onClick={() => handleDeletePatient(pat.id)}
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "Payments" && (
          <section
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <div
              style={{
                display: "flex",
                gap: "12px",
                borderBottom: "1px solid var(--glass-border)",
                paddingBottom: "12px",
                flexWrap: "wrap",
              }}
            >
              {["ALL", "PENDING", "SUCCESS", "FAILED", "CANCELLED"].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setPaymentStatusFilter(status)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color:
                        paymentStatusFilter === status
                          ? "var(--gradient-1)"
                          : "var(--text-secondary)",
                      fontWeight: paymentStatusFilter === status ? 600 : 400,
                      padding: "8px 16px",
                      cursor: "pointer",
                      borderBottom:
                        paymentStatusFilter === status
                          ? "2px solid var(--gradient-1)"
                          : "2px solid transparent",
                    }}
                  >
                    {status}
                  </button>
                ),
              )}
            </div>

            {paymentsLoading ? (
              <div style={{ color: "var(--text-secondary)" }}>
                Loading payments...
              </div>
            ) : paymentsError ? (
              <div
                className="glass-panel"
                style={{
                  padding: "16px",
                  color: "#ef4444",
                  borderColor: "rgba(239, 68, 68, 0.3)",
                }}
              >
                {paymentsError}
              </div>
            ) : (
              <div style={{ display: "grid", gap: "16px" }}>
                {filteredPayments.map((payment) => (
                  <div
                    key={payment.id}
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
                        <h4
                          style={{ fontSize: "1.05rem", marginBottom: "6px" }}
                        >
                          Order #{payment.orderId || "N/A"}
                        </h4>
                        <p
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.88rem",
                          }}
                        >
                          Appointment ID: {payment.appointmentId}
                        </p>
                        <p
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.82rem",
                          }}
                        >
                          Updated:{" "}
                          {payment.updatedAt
                            ? new Date(payment.updatedAt).toLocaleString()
                            : "N/A"}
                        </p>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            display: "inline-flex",
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontWeight: 600,
                            fontSize: "0.82rem",
                            background:
                              payment.status === "SUCCESS"
                                ? "rgba(16, 185, 129, 0.1)"
                                : payment.status === "PENDING"
                                  ? "rgba(245, 158, 11, 0.1)"
                                  : "rgba(239, 68, 68, 0.1)",
                            color:
                              payment.status === "SUCCESS"
                                ? "#10b981"
                                : payment.status === "PENDING"
                                  ? "#f59e0b"
                                  : "#ef4444",
                          }}
                        >
                          {payment.status}
                        </div>
                        <p
                          style={{
                            color: "var(--text-secondary)",
                            marginTop: "8px",
                            fontSize: "0.9rem",
                          }}
                        >
                          {payment.currency || "LKR"}{" "}
                          {Number(payment.amount || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {payment.status === "PENDING" && payment.orderId && (
                      <div style={{ marginTop: "14px" }}>
                        <button
                          className="btn-outline"
                          style={{
                            borderColor: "rgba(239, 68, 68, 0.3)",
                            color: "#ef4444",
                          }}
                          onClick={() => handleCancelPayment(payment.orderId)}
                        >
                          Cancel Pending Payment
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {!paymentsLoading && filteredPayments.length === 0 && (
                  <div
                    className="glass-panel"
                    style={{
                      padding: "24px",
                      textAlign: "center",
                      color: "var(--text-secondary)",
                    }}
                  >
                    No payments found for status: {paymentStatusFilter}.
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
