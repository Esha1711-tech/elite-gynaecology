import { useEffect, useState } from "react";
import { FileText, Pill, Upload, Download } from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:5000";
const fileUrl = (url) => url?.startsWith("http") ? url : `${API_ORIGIN}${url}`;

const HealthRecords = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", file: null });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [p, r] = await Promise.all([api.get("/prescriptions"), api.get("/reports/mine")]);
      setPrescriptions(p.data.prescriptions || []);
      setReports(r.data.reports || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to load health records.");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const upload = async (e) => {
    e.preventDefault();
    if (!form.title || !form.file) return toast.error("Title and file are required.");
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("report", form.file);
    try {
      await api.post("/reports/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Report uploaded.");
      setForm({ title: "", description: "", file: null });
      document.getElementById("patientReportFile").value = "";
      load();
    } catch (err) { toast.error(err.response?.data?.message || "Upload failed."); }
  };

  if (loading) return <div className="py-20 text-center">Loading health records...</div>;

  return (
    <div className="min-h-screen bg-primary-light py-10">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        <div><p className="section-label">Medical History</p><h1 className="mt-3 text-3xl font-bold text-accent-navy">Prescriptions & Reports</h1></div>

        <div className="grid lg:grid-cols-2 gap-6">
          <section className="card">
            <h2 className="text-xl font-semibold text-accent-navy flex items-center gap-2"><Pill className="w-5 h-5" /> Doctor Prescriptions</h2>
            <div className="mt-5 space-y-3">
              {prescriptions.length === 0 ? <p className="text-text-light">No prescriptions yet.</p> : prescriptions.map(p => (
                <div key={p._id} className="p-4 rounded-xl bg-secondary-sage/50">
                  <p className="font-semibold text-accent-navy">{p.diagnosis}</p>
                  <p className="text-xs text-text-light mt-1">Dr. {p.doctor?.name} • {new Date(p.createdAt).toLocaleDateString()}</p>
                  <div className="mt-2 space-y-1">{p.medicines.map((m, i) => <p key={i} className="text-sm">• {m.name} — {m.dosage}, {m.frequency}, {m.duration}{m.instructions ? ` — ${m.instructions}` : ""}</p>)}</div>
                  {p.recommendations && <p className="text-sm mt-3"><b>Doctor's recommendation:</b> {p.recommendations}</p>}
                  {p.doctorNotes && <p className="text-sm mt-1"><b>Notes:</b> {p.doctorNotes}</p>}
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <h2 className="text-xl font-semibold text-accent-navy flex items-center gap-2"><FileText className="w-5 h-5" /> My Medical Reports</h2>
            <div className="mt-5 space-y-3">
              {reports.length === 0 ? <p className="text-text-light">No reports uploaded.</p> : reports.map(r => (
                <a key={r._id} href={fileUrl(r.fileUrl)} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 rounded-xl bg-secondary-pink/60">
                  <div><p className="font-semibold text-accent-navy">{r.title}</p><p className="text-xs text-text-light">{r.fileName} • uploaded by {r.uploadedByRole}</p></div>
                  <Download className="w-5 h-5 text-accent-navy" />
                </a>
              ))}
            </div>
          </section>
        </div>

        {user?.role === "patient" && (
          <section className="card max-w-2xl">
            <h2 className="text-xl font-semibold text-accent-navy flex items-center gap-2"><Upload className="w-5 h-5" /> Upload a Report</h2>
            <p className="text-sm text-text-light mt-1">You can upload lab results, scans or other medical documents for your doctor.</p>
            <form onSubmit={upload} className="space-y-3 mt-5">
              <input className="input-field" placeholder="Report title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <textarea className="input-field" placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <input id="patientReportFile" type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={e => setForm({ ...form, file: e.target.files?.[0] || null })} />
              <button className="btn-primary"><Upload className="w-4 h-4 inline mr-2" /> Upload Report</button>
            </form>
          </section>
        )}
      </div>
    </div>
  );
};

export default HealthRecords;
