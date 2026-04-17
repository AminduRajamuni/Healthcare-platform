import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, CreditCard, Loader2, ShieldCheck, X } from "lucide-react";
import paymentService from "../services/paymentService";

const PaymentModal = ({ isOpen, onClose, appointment, onPaymentInitiated }) => {
  const firstName = localStorage.getItem("firstName") || "";

  const [formData, setFormData] = useState({
    firstName,
    lastName: "",
    email: localStorage.getItem("email") || "",
    phone: "",
    address: "",
    city: "",
    country: "Sri Lanka",
    amount: "",
    currency: "LKR",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setError("");
    setLoading(false);
    setFormData({
      firstName: localStorage.getItem("firstName") || "",
      lastName: "",
      email: localStorage.getItem("email") || "",
      phone: "",
      address: "",
      city: "",
      country: "Sri Lanka",
      amount: "",
      currency: "LKR",
    });
  }, [isOpen, appointment?.id]);

  const appointmentLabel = useMemo(() => {
    if (!appointment?.appointmentDate) {
      return "Selected appointment";
    }
    const date = new Date(appointment.appointmentDate);
    if (Number.isNaN(date.getTime())) {
      return "Selected appointment";
    }
    return date.toLocaleString();
  }, [appointment]);

  if (!isOpen) {
    return null;
  }

  if (!appointment) {
    return null;
  }

  const setField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const extractErrorMessage = (err) => {
    return (
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      "Unable to start PayHere checkout."
    );
  };

  const submitToPayHere = (payHereData) => {
    try {
      const checkoutUrl = payHereData.checkoutUrl;
      if (!checkoutUrl) {
        throw new Error("PayHere checkout URL is missing.");
      }

      const fields = {
        merchant_id: payHereData.merchant_id || payHereData.merchantId,
        return_url: payHereData.return_url || payHereData.returnUrl,
        cancel_url: payHereData.cancel_url || payHereData.cancelUrl,
        notify_url: payHereData.notify_url || payHereData.notifyUrl,
        order_id: payHereData.order_id || payHereData.orderId,
        items: payHereData.items,
        currency: payHereData.currency,
        amount: payHereData.amount,
        first_name: payHereData.first_name || payHereData.firstName,
        last_name: payHereData.last_name || payHereData.lastName,
        email: payHereData.email,
        phone: payHereData.phone,
        address: payHereData.address,
        city: payHereData.city,
        country: payHereData.country,
        hash: payHereData.hash,
      };

      const requiredFields = [
        "merchant_id",
        "order_id",
        "currency",
        "amount",
        "hash",
      ];
      const missingFields = requiredFields.filter(
        (key) => !fields[key] || String(fields[key]).trim() === "",
      );
      if (missingFields.length > 0) {
        throw new Error(
          `PayHere response is missing required fields: ${missingFields.join(", ")}`,
        );
      }

      console.info("[PayHere] Redirecting to checkout", {
        checkoutUrl,
        merchantId: fields.merchant_id,
        orderId: fields.order_id,
        amount: fields.amount,
        currency: fields.currency,
        sandbox: payHereData.sandbox,
      });

      const form = document.createElement("form");
      form.method = "POST";
      form.action = checkoutUrl;

      Object.entries(fields).forEach(([name, value]) => {
        if (value === undefined || value === null || value === "") {
          return;
        }
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    } catch (submitError) {
      console.error("[PayHere] submitToPayHere failed", {
        error: submitError,
        payHereData,
      });
      throw submitError;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const parsedAmount = Number(formData.amount);
      if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error("Amount must be a valid number greater than 0.");
      }

      const payload = {
        appointmentId: appointment.id,
        amount: parsedAmount,
        currency: formData.currency,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        country: formData.country,
      };

      const response = await paymentService.initiatePayHerePayment(payload);
      if (onPaymentInitiated) {
        onPaymentInitiated(response);
      }
      submitToPayHere(response);
    } catch (err) {
      console.error("[PayHere] checkout initiation failed", {
        error: err,
        appointmentId: appointment?.id,
        payload: {
          ...formData,
          amount: formData.amount,
        },
        responseStatus: err?.response?.status,
        responseData: err?.response?.data,
      });
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: "rgba(13, 11, 20, 0.85)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: "92%",
          maxWidth: "640px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--glass-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h3
              className="text-h3"
              style={{
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <CreditCard size={18} /> Complete Payment
            </h3>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.9rem",
                marginTop: "6px",
              }}
            >
              {appointmentLabel}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-outline"
            style={{ border: "none", padding: "6px", lineHeight: 0 }}
            disabled={loading}
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {error && (
            <div
              style={{
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#ef4444",
                background: "rgba(239, 68, 68, 0.1)",
                borderRadius: "8px",
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.9rem",
              }}
            >
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  color: "var(--text-secondary)",
                  fontSize: "0.85rem",
                }}
              >
                First Name
              </label>
              <input
                className="glass-input"
                value={formData.firstName}
                onChange={(e) => setField("firstName", e.target.value)}
                required
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  color: "var(--text-secondary)",
                  fontSize: "0.85rem",
                }}
              >
                Last Name
              </label>
              <input
                className="glass-input"
                value={formData.lastName}
                onChange={(e) => setField("lastName", e.target.value)}
                required
              />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  color: "var(--text-secondary)",
                  fontSize: "0.85rem",
                }}
              >
                Email
              </label>
              <input
                type="email"
                className="glass-input"
                value={formData.email}
                onChange={(e) => setField("email", e.target.value)}
                required
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  color: "var(--text-secondary)",
                  fontSize: "0.85rem",
                }}
              >
                Phone
              </label>
              <input
                className="glass-input"
                value={formData.phone}
                onChange={(e) => setField("phone", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
              }}
            >
              Address
            </label>
            <input
              className="glass-input"
              value={formData.address}
              onChange={(e) => setField("address", e.target.value)}
              required
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "12px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  color: "var(--text-secondary)",
                  fontSize: "0.85rem",
                }}
              >
                City
              </label>
              <input
                className="glass-input"
                value={formData.city}
                onChange={(e) => setField("city", e.target.value)}
                required
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  color: "var(--text-secondary)",
                  fontSize: "0.85rem",
                }}
              >
                Country
              </label>
              <input
                className="glass-input"
                value={formData.country}
                onChange={(e) => setField("country", e.target.value)}
                required
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  color: "var(--text-secondary)",
                  fontSize: "0.85rem",
                }}
              >
                Currency
              </label>
              <input
                className="glass-input"
                value={formData.currency}
                onChange={(e) =>
                  setField("currency", e.target.value.toUpperCase())
                }
                maxLength={3}
                required
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
              }}
            >
              Amount
            </label>
            <input
              type="number"
              className="glass-input"
              min="0.01"
              step="0.01"
              placeholder="Enter consultation fee"
              value={formData.amount}
              onChange={(e) => setField("amount", e.target.value)}
              required
            />
          </div>

          <div
            style={{
              border: "1px solid var(--glass-border)",
              borderRadius: "8px",
              padding: "10px 12px",
              color: "var(--text-secondary)",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ShieldCheck size={16} /> You will be redirected to PayHere secure
            checkout.
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "8px",
            }}
          >
            <button
              type="button"
              className="btn-outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ minWidth: "170px" }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Redirecting...
                </>
              ) : (
                "Pay with PayHere"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
