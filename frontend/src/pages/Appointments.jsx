import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  CreditCard,
  FileText,
  Upload,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { validateUploadFile } from "../utils/fileValidation";

const NATIONAL_FEE = 3000;
const INTERNATIONAL_FEE = 50;

const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [formData, setFormData] = useState({
    date: "",
    timeSlot: "09:00 AM",
    reason: "",
    country: user?.country || "Pakistan",
    paymentMethod: "Easypaisa",
    notes: "",
    consultationType: "online",
  });
  const [paymentSlip, setPaymentSlip] = useState(null);
  const [paymentInputKey, setPaymentInputKey] = useState(0);

  const timeSlots = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
  ];

  const isPakistan = formData.country.trim().toLowerCase() === "pakistan";
  const fee = isPakistan ? NATIONAL_FEE : INTERNATIONAL_FEE;
  const currency = isPakistan ? "PKR" : "USD";
  const methods = useMemo(
    () => (isPakistan ? ["Easypaisa", "JazzCash"] : ["Payoneer"]),
    [isPakistan],
  );

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: isPakistan ? "Easypaisa" : "Payoneer",
    }));
  }, [isPakistan]);

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments");
      setAppointments(res.data.appointments || []);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Unable to load appointments.",
      );
    } finally {
      setLoadingList(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!paymentSlip) {
      toast.error(
        "Payment slip is required before submitting the appointment.",
      );
      return;
    }

    if (!formData.reason.trim()) {
      toast.error("Please enter the reason for consultation.");
      return;
    }

    const data = new FormData();
    data.append("appointmentDate", formData.date);
    data.append("appointmentTime", formData.timeSlot);
    data.append("reason", formData.reason);
    data.append("country", formData.country);
    data.append("paymentMethod", formData.paymentMethod);
    data.append("notes", formData.notes);
    data.append("consultationType", formData.consultationType);
    data.append("paymentSlip", paymentSlip);

    setLoading(true);
    try {
      await api.post("/appointments", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Appointment and payment slip submitted successfully.");
      setFormData((prev) => ({
        ...prev,
        date: "",
        reason: "",
        notes: "",
      }));
      setPaymentSlip(null);
      setPaymentInputKey((k) => k + 1);
      fetchAppointments();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to submit appointment.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (apt) => {
    if (apt.appointmentStatus === "confirmed") return "Confirmed";
    if (apt.appointmentStatus === "completed") return "Completed";
    if (apt.appointmentStatus === "rejected") return "Rejected";
    if (apt.appointmentStatus === "cancelled") return "Cancelled";
    return apt.paymentStatus === "pending"
      ? "Payment Verification Pending"
      : "Pending";
  };

  const getStatusColor = (status) =>
    ({
      Confirmed: "bg-green-100 text-green-800",
      Completed: "bg-gray-100 text-gray-800",
      Rejected: "bg-red-100 text-red-800",
      Cancelled: "bg-gray-100 text-gray-600",
      "Payment Verification Pending": "bg-yellow-100 text-yellow-800",
      Pending: "bg-blue-100 text-blue-800",
    })[status] || "bg-gray-100 text-gray-800";

  return (
    <div className="min-h-screen bg-primary-light py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="section-label">Consultation Booking</p>
          <h1 className="mt-3 text-3xl font-bold text-accent-navy">
            Book an Appointment
          </h1>
          <p className="mt-2 text-text-light">
            One dedicated gynaecologist • Payment is submitted with your
            appointment request.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="card sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-secondary-sage flex items-center justify-center">
                  <UserRound className="w-5 h-5 text-accent-navy" />
                </div>
                <div>
                  <p className="text-xs text-text-light">Consulting Doctor</p>
                  <p className="font-semibold text-accent-navy">
                    Dr. Ambreen Akhtar
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">
                    Appointment Date
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    className="input-field"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">
                    Time Slot
                  </label>
                  <select
                    className="input-field"
                    value={formData.timeSlot}
                    onChange={(e) =>
                      setFormData({ ...formData, timeSlot: e.target.value })
                    }
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot}>{slot}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">
                    Country
                  </label>
                  <select
                    className="input-field"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                  >
                    <option value="Pakistan">Pakistan</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="rounded-xl bg-secondary-pink p-4">
                  <p className="text-xs text-text-light">Consultation Fee</p>
                  <p className="text-2xl font-bold text-accent-navy mt-1">
                    {currency} {fee}
                  </p>
                  <p className="text-xs text-text-light mt-1">
                    {isPakistan
                      ? "National consultation fee"
                      : "International consultation fee"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">
                    Payment Method
                  </label>
                  <select
                    className="input-field"
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentMethod: e.target.value,
                      })
                    }
                  >
                    {methods.map((method) => (
                      <option key={method}>{method}</option>
                    ))}
                  </select>
                  <p className="text-xs text-text-light mt-1">
                    {isPakistan
                      ? "Transfer the PKR fee through Easypaisa or JazzCash and upload the payment slip."
                      : "Pay the USD fee through Payoneer and upload the payment slip."}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">
                    Payment Slip *
                  </label>
                  <label
                    htmlFor="paymentSlip"
                    className="flex items-center gap-3 border-2 border-dashed border-secondary-sage rounded-xl p-4 cursor-pointer hover:bg-secondary-sage/30"
                  >
                    <Upload className="w-5 h-5 text-accent-sage" />
                    <span className="text-sm text-text-light truncate">
                      {paymentSlip
                        ? paymentSlip.name
                        : "Upload JPG, JPEG or PNG (max 50KB)"}
                    </span>
                  </label>
                  <input
                    key={paymentInputKey}
                    id="paymentSlip"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
  const file = e.target.files?.[0];

  if (!file) return;

  const result = validateUploadFile(file);

  if (!result.valid) {
    toast.error(result.message);
    e.target.value = "";
    return;
  }

  setPaymentSlip(file);
}}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">
                    Reason for Consultation
                  </label>
                  <textarea
                    required
                    rows="3"
                    className="input-field"
                    placeholder="Describe your concern..."
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    rows="2"
                    className="input-field"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>

                <button
                  disabled={loading || !paymentSlip}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit Appointment & Payment"}
                </button>

                <div className="flex items-start gap-2 text-xs text-text-light">
                  <ShieldCheck className="w-4 h-4 text-accent-sage shrink-0" />
                  <span>
                    Your appointment is not confirmed until the doctor verifies
                    your uploaded payment slip.
                  </span>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="card">
              <h2 className="text-xl font-semibold text-accent-navy flex items-center gap-2">
                <Calendar className="w-5 h-5" /> My Appointment History
              </h2>
            </div>

            {loadingList ? (
              <div className="card text-center py-10">Loading...</div>
            ) : appointments.length === 0 ? (
              <div className="card text-center py-12 text-text-light">
                No appointments yet.
              </div>
            ) : (
              appointments.map((apt) => {
                const status = getStatus(apt);
                return (
                  <div key={apt._id} className="card">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}
                          >
                            {status}
                          </span>
                          <span className="text-sm text-text-light flex items-center gap-1">
                            <Clock className="w-4 h-4" />{" "}
                            {new Date(apt.appointmentDate).toLocaleDateString()}{" "}
                            • {apt.appointmentTime}
                          </span>
                        </div>
                        <p className="font-semibold text-accent-navy">
                          {apt.consultationFee} {apt.currency}
                        </p>
                        <p className="text-sm text-text-light">{apt.reason}</p>
                        <p className="text-xs text-text-light">
                          Payment: {apt.paymentMethod} • {apt.paymentStatus}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-accent-navy bg-secondary-sage px-3 py-2 rounded-lg">
                        <FileText className="w-4 h-4" />
                        Payment slip submitted
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
