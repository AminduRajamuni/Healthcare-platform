import React, { useState, useEffect } from "react";
import {
  Activity,
  Heart,
  Calendar,
  Stethoscope,
  CreditCard,
  Clock,
  LogOut,
  RotateCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import appointmentService from "../services/appointmentService";
import paymentService from "../services/paymentService";
import AppointmentCard from "../components/AppointmentCard";
import BookAppointmentModal from "../components/BookAppointmentModal";
import ConfirmDialog from "../components/ConfirmDialog";
import PaymentModal from "../components/PaymentModal";

export default function PatientDashboard() {
  const navigate = useNavigate();
  // Fetch from localStorage instead of mock ID
  const patientId = localStorage.getItem("userId") || 1;
  const firstName = localStorage.getItem("firstName") || "User";

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming"); // 'upcoming' or 'past'
  const [dashboardSection, setDashboardSection] = useState("appointments"); // 'appointments' | 'payments'

  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState("");

  // Modal States
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentAppointment, setSelectedPaymentAppointment] =
    useState(null);

  // Confirmation Dialog States
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    appointment: null,
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (dashboardSection === "payments" && appointments.length > 0) {
      fetchPaymentHistory();
    }
  }, [dashboardSection, appointments]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data =
        await appointmentService.getAppointmentsByPatientId(patientId);
      setAppointments(data || []);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (appointment) => {
    setConfirmDialog({ isOpen: true, appointment });
  };

  const executeCancellation = async () => {
    if (!confirmDialog.appointment) return;
    try {
      await appointmentService.cancelAppointment(confirmDialog.appointment.id);
      fetchAppointments();
    } catch (error) {
      console.error("Failed to cancel appointment", error);
    } finally {
      setConfirmDialog({ isOpen: false, appointment: null });
    }
  };

  const fetchPaymentHistory = async () => {
    setPaymentsLoading(true);
    setPaymentsError("");
    try {
      const history = await Promise.all(
        appointments.map(async (appointment) => {
          try {
            const payment = await paymentService.getPaymentStatus(
              appointment.id,
            );
            return { appointment, payment };
          } catch (error) {
            if (error?.response?.status === 404) {
              return { appointment, payment: null };
            }
            throw error;
          }
        }),
      );
      const sorted = history.sort(
        (a, b) =>
          new Date(b.appointment.appointmentDate) -
          new Date(a.appointment.appointmentDate),
      );
      setPaymentHistory(sorted);
    } catch (error) {
      console.error("Failed to fetch payment history:", error);
      setPaymentsError("Unable to load payment history right now.");
    } finally {
      setPaymentsLoading(false);
    }
  };

  const openPaymentModal = (appointment) => {
    setSelectedPaymentAppointment(appointment);
    setIsPaymentModalOpen(true);
  };

  const handleCancelPendingPayment = async (orderId) => {
    if (!orderId) return;
    if (!window.confirm("Cancel this pending payment attempt?")) return;
    try {
      await paymentService.cancelPaymentByOrderId(orderId);
      await fetchPaymentHistory();
    } catch (error) {
      console.error("Failed to cancel pending payment", error);
      alert("Failed to cancel pending payment.");
    }
  };

  const getPaymentDisplay = (payment) => {
    if (!payment) {
      return {
        label: "NOT_DONE",
        color: "#ef4444",
        bg: "rgba(239, 68, 68, 0.1)",
      };
    }

    switch (payment.status) {
      case "SUCCESS":
        return {
          label: "SUCCESS",
          color: "#10b981",
          bg: "rgba(16, 185, 129, 0.1)",
        };
      case "PENDING":
        return {
          label: "PENDING",
          color: "#f59e0b",
          bg: "rgba(245, 158, 11, 0.1)",
        };
      case "CANCELLED":
        return {
          label: "CANCELLED",
          color: "#64748b",
          bg: "rgba(100, 116, 139, 0.2)",
        };
      case "FAILED":
        return {
          label: "FAILED",
          color: "#ef4444",
          bg: "rgba(239, 68, 68, 0.1)",
        };
      default:
        return {
          label: payment.status,
          color: "var(--text-secondary)",
          bg: "var(--glass-bg)",
        };
    }
  };

  const currentDate = new Date();

  // Categorize appointments
  const activeAppointments = appointments
    .filter(
      (app) =>
        (app.status === "BOOKED" ||
          app.status === "PENDING" ||
          app.status === "ACCEPTED") &&
        new Date(app.appointmentDate) >= currentDate,
    )
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

  const pastAndCancelledAppointments = appointments
    .filter(
      (app) =>
        app.status === "CANCELLED" ||
        app.status === "COMPLETED" ||
        app.status === "REJECTED" ||
        new Date(app.appointmentDate) < currentDate,
    )
    .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

  const displayAppointments =
    activeTab === "upcoming"
      ? activeAppointments
      : pastAndCancelledAppointments;
  const nextAppointment =
    activeAppointments.length > 0 ? activeAppointments[0] : null;
  const paidCount = paymentHistory.filter(
    (item) => item.payment?.status === "SUCCESS",
  ).length;
  const pendingCount = paymentHistory.filter(
    (item) => item.payment?.status === "PENDING",
  ).length;
  const unpaidCount = paymentHistory.filter(
    (item) =>
      !item.payment ||
      item.payment.status === "FAILED" ||
      item.payment.status === "CANCELLED",
  ).length;

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
            <Activity color="#ec4899" size={24} />
          </div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "white" }}>
            Patient Portal
          </h2>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-item">
            <Heart size={20} /> My Health
          </div>
          <div
            className={`nav-item ${dashboardSection === "appointments" ? "active" : ""}`}
            onClick={() => setDashboardSection("appointments")}
          >
            <Calendar size={20} /> Appointments
          </div>
          <div
            className="nav-item"
            onClick={() => navigate("/symptom-checker")}
          >
            <Stethoscope size={20} /> Symptom Checker
          </div>
          <div className="nav-item">
            <Clock size={20} /> Medical History
          </div>
          <div
            className={`nav-item ${dashboardSection === "payments" ? "active" : ""}`}
            onClick={() => setDashboardSection("payments")}
          >
            <CreditCard size={20} /> Invoices & Payments
          </div>
        </nav>

        <div style={{ marginTop: "auto" }}>
          <div className="nav-item" onClick={() => navigate("/")}>
            <LogOut size={20} /> Sign Out
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div>
            <h1 className="text-h2">
              {dashboardSection === "appointments"
                ? `Hello, ${firstName}`
                : "Payments & Invoices"}
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>
              {dashboardSection === "appointments"
                ? "Track your health and upcoming appointments."
                : "Manage pending payments and review transaction statuses."}
            </p>
          </div>
          {dashboardSection === "appointments" ? (
            <button
              className="btn-primary"
              style={{
                background: "linear-gradient(to right, #ec4899, #f43f5e)",
              }}
              onClick={() => setIsBookModalOpen(true)}
            >
              <Calendar size={18} /> Book New Appointment
            </button>
          ) : (
            <button className="btn-outline" onClick={fetchPaymentHistory}>
              <RotateCw size={16} /> Refresh Payments
            </button>
          )}
        </header>

        {dashboardSection === "appointments" && (
          <>
            {/* Featured Next Appointment Card (if any) */}
            {nextAppointment && activeTab === "upcoming" && (
              <section
                className="glass-panel"
                style={{
                  padding: "24px",
                  marginBottom: "32px",
                  borderLeft: "4px solid var(--gradient-1)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        color: "var(--gradient-1)",
                        fontWeight: 600,
                        marginBottom: "8px",
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        fontSize: "0.8rem",
                      }}
                    >
                      Next Upcoming Appointment
                    </h3>
                    <h2 className="text-h2">
                      Doctor ID: {nextAppointment.doctorId}
                    </h2>
                    <p style={{ color: "var(--text-secondary)" }}>
                      {new Date(
                        nextAppointment.appointmentDate,
                      ).toLocaleString()}
                    </p>
                  </div>
                  <div
                    style={{
                      padding: "12px 24px",
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: "12px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "2rem", fontWeight: 700 }}>
                      {Math.ceil(
                        (new Date(nextAppointment.appointmentDate).getTime() -
                          new Date().getTime()) /
                          (1000 * 3600 * 24),
                      )}
                    </div>
                    <div
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.8rem",
                      }}
                    >
                      Days Left
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Tabs */}
            <div
              style={{
                display: "flex",
                gap: "24px",
                borderBottom: "1px solid var(--glass-border)",
                marginBottom: "24px",
              }}
            >
              <button
                onClick={() => setActiveTab("upcoming")}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: "12px 0",
                  fontSize: "1.1rem",
                  cursor: "pointer",
                  color:
                    activeTab === "upcoming"
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                  borderBottom:
                    activeTab === "upcoming"
                      ? "2px solid var(--gradient-1)"
                      : "2px solid transparent",
                  fontWeight: activeTab === "upcoming" ? 600 : 400,
                }}
              >
                Active Appointments ({activeAppointments.length})
              </button>
              <button
                onClick={() => setActiveTab("past")}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: "12px 0",
                  fontSize: "1.1rem",
                  cursor: "pointer",
                  color:
                    activeTab === "past"
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                  borderBottom:
                    activeTab === "past"
                      ? "2px solid var(--gradient-1)"
                      : "2px solid transparent",
                  fontWeight: activeTab === "past" ? 600 : 400,
                }}
              >
                History / Cancelled ({pastAndCancelledAppointments.length})
              </button>
            </div>

            {/* Appointment Grid */}
            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "var(--text-secondary)",
                }}
              >
                Loading appointments...
              </div>
            ) : (
              <section
                className="card-grid"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                }}
              >
                {displayAppointments.map((app) => (
                  <AppointmentCard
                    key={app.id}
                    appointment={app}
                    role="PATIENT"
                    onCancel={handleCancelClick}
                    onPay={openPaymentModal}
                  />
                ))}

                {displayAppointments.length === 0 && (
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      padding: "48px",
                      textAlign: "center",
                      background: "var(--glass-bg)",
                      borderRadius: "16px",
                      border: "1px dashed var(--glass-border)",
                    }}
                  >
                    <Calendar
                      size={48}
                      style={{
                        color: "var(--text-secondary)",
                        opacity: 0.5,
                        marginBottom: "16px",
                      }}
                    />
                    <h3 style={{ fontSize: "1.2rem", marginBottom: "8px" }}>
                      No appointments found
                    </h3>
                    <p style={{ color: "var(--text-secondary)" }}>
                      {activeTab === "upcoming"
                        ? "You have no scheduled appointments at the moment."
                        : "You have no past or cancelled appointments."}
                    </p>
                  </div>
                )}
              </section>
            )}
          </>
        )}

        {dashboardSection === "payments" && (
          <>
            <section className="card-grid" style={{ marginBottom: "8px" }}>
              {[
                { title: "Paid", value: paidCount, color: "#10b981" },
                { title: "Pending", value: pendingCount, color: "#f59e0b" },
                {
                  title: "Unpaid / Failed",
                  value: unpaidCount,
                  color: "#ef4444",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="glass-panel"
                  style={{ padding: "20px" }}
                >
                  <p
                    style={{ color: "var(--text-secondary)", fontWeight: 500 }}
                  >
                    {item.title}
                  </p>
                  <h3
                    className="text-h2"
                    style={{ marginTop: "6px", color: item.color }}
                  >
                    {item.value}
                  </h3>
                </div>
              ))}
            </section>

            {paymentsLoading ? (
              <div
                style={{
                  textAlign: "center",
                  color: "var(--text-secondary)",
                  padding: "36px",
                }}
              >
                Loading payments...
              </div>
            ) : paymentsError ? (
              <div
                className="glass-panel"
                style={{
                  padding: "18px",
                  color: "#ef4444",
                  borderColor: "rgba(239, 68, 68, 0.3)",
                }}
              >
                {paymentsError}
              </div>
            ) : (
              <section style={{ display: "grid", gap: "16px" }}>
                {paymentHistory.map(({ appointment, payment }) => {
                  const paymentDisplay = getPaymentDisplay(payment);
                  const canPay =
                    (!payment ||
                      payment.status === "FAILED" ||
                      payment.status === "CANCELLED") &&
                    appointment.status !== "CANCELLED" &&
                    appointment.status !== "COMPLETED";

                  return (
                    <div
                      key={`pay-${appointment.id}`}
                      className="glass-panel"
                      style={{ padding: "18px" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "16px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div>
                          <h4
                            style={{ fontSize: "1.1rem", marginBottom: "4px" }}
                          >
                            Appointment #{appointment.id}
                          </h4>
                          <p
                            style={{
                              color: "var(--text-secondary)",
                              fontSize: "0.9rem",
                            }}
                          >
                            Doctor ID: {appointment.doctorId} •{" "}
                            {new Date(
                              appointment.appointmentDate,
                            ).toLocaleString()}
                          </p>
                          {payment?.orderId && (
                            <p
                              style={{
                                color: "var(--text-secondary)",
                                fontSize: "0.82rem",
                                marginTop: "6px",
                              }}
                            >
                              Order ID: {payment.orderId}
                            </p>
                          )}
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "4px 10px",
                              borderRadius: "20px",
                              background: paymentDisplay.bg,
                              color: paymentDisplay.color,
                              fontWeight: 600,
                              fontSize: "0.82rem",
                            }}
                          >
                            {paymentDisplay.label}
                          </span>
                          <p
                            style={{
                              color: "var(--text-secondary)",
                              fontSize: "0.86rem",
                              marginTop: "8px",
                            }}
                          >
                            {payment
                              ? `${payment.currency || "LKR"} ${Number(payment.amount || 0).toFixed(2)}`
                              : "No payment record"}
                          </p>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          marginTop: "14px",
                        }}
                      >
                        {canPay && (
                          <button
                            className="btn-primary"
                            style={{ padding: "8px 14px" }}
                            onClick={() => openPaymentModal(appointment)}
                          >
                            <CreditCard size={16} /> Pay Now
                          </button>
                        )}
                        {payment?.status === "PENDING" && payment.orderId && (
                          <button
                            className="btn-outline"
                            style={{
                              borderColor: "rgba(239, 68, 68, 0.3)",
                              color: "#ef4444",
                            }}
                            onClick={() =>
                              handleCancelPendingPayment(payment.orderId)
                            }
                          >
                            Cancel Pending Payment
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {paymentHistory.length === 0 && (
                  <div
                    className="glass-panel"
                    style={{
                      padding: "30px",
                      textAlign: "center",
                      color: "var(--text-secondary)",
                    }}
                  >
                    No appointments found for payment history yet.
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <BookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        patientId={patientId}
        onBooked={fetchAppointments}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmText="Yes, Cancel it"
        cancelText="Keep Appointment"
        onConfirm={executeCancellation}
        onCancel={() => setConfirmDialog({ isOpen: false, appointment: null })}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedPaymentAppointment(null);
        }}
        appointment={selectedPaymentAppointment}
        onPaymentInitiated={() => {
          setIsPaymentModalOpen(false);
        }}
      />
    </div>
  );
}
