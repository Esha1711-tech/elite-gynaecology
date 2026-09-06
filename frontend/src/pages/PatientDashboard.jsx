import { useEffect, useState } from "react";
import { Calendar, CreditCard, Bell, User, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/appointments"), api.get("/notifications")])
      .then(([a, n]) => {
        setAppointments(a.data.appointments || []);
        setNotifications(n.data.notifications || n.data || []);
      })
      .catch((err) => toast.error(err.response?.data?.message || "Unable to load dashboard."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-20 text-center">Loading your dashboard...</div>;

  const confirmed = appointments.filter(a => a.appointmentStatus === "confirmed" || a.appointmentStatus === "completed").length;

  return (
    <div className="min-h-screen bg-primary-light py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div><p className="text-sm text-accent-sage font-semibold">Patient Portal</p><h1 className="text-3xl font-bold text-accent-navy">Hello, {user?.name}</h1><p className="text-text-light mt-1">Your appointments, prescriptions and medical reports.</p></div>
          <div className="flex gap-2"><Link to="/appointments" className="btn-primary">Book Appointment</Link><Link to="/health-records" className="btn-secondary">Health Records</Link></div>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-8">
          <div className="card bg-gradient-to-br from-secondary-pink to-white"><Calendar className="w-7 h-7 text-accent-navy" /><p className="text-3xl font-bold text-accent-navy mt-3">{appointments.length}</p><p className="text-text-light">Appointments</p></div>
          <div className="card bg-gradient-to-br from-secondary-sage to-white"><CreditCard className="w-7 h-7 text-accent-navy" /><p className="text-3xl font-bold text-accent-navy mt-3">{confirmed}</p><p className="text-text-light">Confirmed / Completed</p></div>
          <div className="card bg-white"><Bell className="w-7 h-7 text-accent-navy" /><p className="text-3xl font-bold text-accent-navy mt-3">{notifications.filter(n => !n.isRead).length}</p><p className="text-text-light">Unread Notifications</p></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex justify-between items-center mb-5"><h2 className="text-xl font-semibold text-accent-navy">Appointment History</h2><Link to="/appointments" className="text-sm font-semibold text-accent-navy">View all</Link></div>
            {appointments.length === 0 ? <p className="text-text-light">No appointments yet.</p> : appointments.slice(0, 6).map(a => (
              <div key={a._id} className="p-4 rounded-xl bg-primary-light mb-3">
                <div className="flex justify-between gap-3"><div><p className="font-semibold text-accent-navy">{new Date(a.appointmentDate).toLocaleDateString()} • {a.appointmentTime}</p><p className="text-sm text-text-light">{a.reason}</p><p className="text-sm mt-1">{a.consultationFee} {a.currency} • {a.paymentMethod}</p></div><span className="text-xs font-semibold">{a.appointmentStatus}</span></div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="flex justify-between items-center mb-5"><h2 className="text-xl font-semibold text-accent-navy flex gap-2"><FileText className="w-5 h-5" /> Medical Information</h2><Link to="/health-records" className="text-sm font-semibold text-accent-navy">Open records</Link></div>
            <p className="text-text-light leading-7">Your doctor can add prescriptions and recommendations after consultations. You can also upload your own lab reports, scans and other medical documents for the doctor to review.</p>
            <div className="mt-5 p-4 rounded-xl bg-secondary-sage"><User className="w-5 h-5 text-accent-navy" /><p className="font-semibold text-accent-navy mt-2">{user?.name}</p><p className="text-sm text-text-light">{user?.email} • {user?.country}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
