import { useEffect, useRef, useState } from "react";
import RichTextEditor from "../components/RichTextEditor";
import { validateUploadFile } from "../utils/fileValidation";
import { openSecureFile } from "../utils/openSecureFile";
import {
  Users,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  FileText,
  Pill,
  Upload,
  Search,
  XCircle,
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Settings,
  Palette,
  Save,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/api";

// const API_ORIGIN =
//   import.meta.env.VITE_API_ORIGIN || "http://localhost:5000";

// const fileUrl = (url) =>
//   url?.startsWith("http") ? url : `${API_ORIGIN}${url}`;

const emptyPrescription = {
  diagnosis: "",
  medicines: [
    {
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    },
  ],
  doctorNotes: "",
  recommendations: "",
  followUpDate: "",
};

const emptyReport = {
  title: "",
  description: "",
  file: null,
};

const emptyBlog = {
  title: "",
  excerpt: "",
  content: "",
  category: "Women's Health",
  tags: "",
  featuredImage: "",
  isPublished: true,
};

const DoctorDashboard = () => {
  const [data, setData] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [history, setHistory] = useState(null);

  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [prescription, setPrescription] =
    useState(emptyPrescription);

  const [report, setReport] = useState(emptyReport);
  const [reportInputKey, setReportInputKey] = useState(0);

  // =========================
  // BLOG STATES
  // =========================
  const [blogs, setBlogs] = useState([]);
  const [blogLoading, setBlogLoading] = useState(false);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [blogForm, setBlogForm] = useState(emptyBlog);
  const [blogPage, setBlogPage] = useState(1);
  const [blogPagination, setBlogPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalBlogs: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [patientPage, setPatientPage] = useState(1);

const [patientPagination, setPatientPagination] = useState({
  currentPage: 1,
  totalPages: 1,
  totalPatients: 0,
  hasNextPage: false,
  hasPreviousPage: false,
});

  const [appointmentPage, setAppointmentPage] = useState(1);
  const [appointmentData, setAppointmentData] = useState([]);
  const [appointmentPagination, setAppointmentPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalAppointments: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const blogFormRef = useRef(null);
  const [blogSaving, setBlogSaving] = useState(false);

  // =========================
  // WEBSITE MANAGEMENT STATES
  // =========================
  const [websiteSettings, setWebsiteSettings] = useState(null);
  const [websiteLoading, setWebsiteLoading] = useState(false);
  const [websiteSaving, setWebsiteSaving] = useState(false);


  useEffect(() => {
    fetchDashboard();
    fetchAppointments(1);
    fetchBlogs(1);
    fetchWebsiteSettings();
  }, []);

  useEffect(() => {
    if (!showBlogForm) return;

    const timer = setTimeout(() => {
      if (!blogFormRef.current) return;

      const top =
        blogFormRef.current.getBoundingClientRect().top +
        window.scrollY -
        100;

      window.scrollTo({
        top,
        behavior: "smooth",
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [showBlogForm, editingBlogId]);

 useEffect(() => {
  const timer = setTimeout(() => {
    setPatientPage(1);
    fetchPatients(search, 1);
  }, 400);

  return () => clearTimeout(timer);
}, [search]);

useEffect(() => {
  if (patientPage === 1) return;

  fetchPatients(search, patientPage);
}, [patientPage]);

  useEffect(() => {
    if (appointmentPage === 1) return;

    fetchAppointments(appointmentPage);
  }, [appointmentPage]);

  useEffect(() => {
    if (blogPage === 1) return;

    fetchBlogs(blogPage);
  }, [blogPage]);

  // =========================
  // DASHBOARD
  // =========================

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/reports");
      setData(res.data);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        "Unable to load doctor dashboard.",
      );
    } finally {
      setLoading(false);
    }
  };

const fetchPatients = async (term = "", page = 1) => {
  try {
    const params = new URLSearchParams();

    params.set("page", page);
    params.set("limit", 10);

    if (term.trim()) {
      params.set("search", term.trim());
    }

    const res = await api.get(
      `/patients?${params.toString()}`
    );

    setPatients(res.data.patients || []);

    setPatientPagination(
      res.data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalPatients: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      }
    );
  } catch (err) {
    console.error(err);

    toast.error(
      err.response?.data?.message ||
        "Unable to load patients."
    );
  }
};

  const fetchAppointments = async (page = 1) => {
    try {
      const res = await api.get(
        `/reports/appointments?page=${page}&limit=10`,
      );

      setAppointmentData(res.data.appointments || []);

      setAppointmentPagination(
        res.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalAppointments: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      );
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          "Unable to load appointments.",
      );
    }
  };

  const openPatient = async (patient) => {
    setSelectedPatient(patient);
    setHistoryLoading(true);

    try {
      const res = await api.get(
        `/patients/${patient._id}/history`,
      );

      setHistory(res.data);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        "Unable to load patient history.",
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  const verifyPayment = async (paymentId, status) => {
    try {
      await api.patch(`/payments/${paymentId}/verify`, {
        status,
      });

      toast.success(
        status === "Successful"
          ? "Payment verified."
          : "Payment rejected.",
      );

      fetchDashboard();
      fetchAppointments(appointmentPage);

      if (selectedPatient) {
        openPatient(selectedPatient);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        "Payment update failed.",
      );
    }
  };

  const updateAppointment = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}/status`, {
        status,
      });

      toast.success(`Appointment ${status}.`);

      fetchDashboard();
      fetchAppointments(appointmentPage);

      if (selectedPatient) {
        openPatient(selectedPatient);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        "Appointment update failed.",
      );
    }
  };

  // =========================
  // PRESCRIPTION
  // =========================

  const updateMedicine = (index, field, value) => {
    setPrescription((p) => {
      const medicines = [...p.medicines];

      medicines[index] = {
        ...medicines[index],
        [field]: value,
      };

      return {
        ...p,
        medicines,
      };
    });
  };

  const addMedicine = () => {
    setPrescription((p) => ({
      ...p,
      medicines: [
        ...p.medicines,
        {
          name: "",
          dosage: "",
          frequency: "",
          duration: "",
          instructions: "",
        },
      ],
    }));
  };

  const createPrescription = async (appointment) => {
    if (
      !selectedPatient ||
      !prescription.diagnosis.trim()
    ) {
      toast.error(
        "Select a patient and enter a diagnosis.",
      );
      return;
    }

    try {
      await api.post("/prescriptions", {
        patient: selectedPatient._id,
        appointment: appointment?._id,
        ...prescription,
      });

      toast.success("Prescription saved.");

      setPrescription(emptyPrescription);

      openPatient(selectedPatient);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        "Unable to save prescription.",
      );
    }
  };

  // =========================
  // MEDICAL REPORT
  // =========================

  const uploadReport = async (e) => {
    e.preventDefault();

    if (
      !selectedPatient ||
      !report.file ||
      !report.title.trim()
    ) {
      toast.error(
        "Select a patient, report title and file.",
      );
      return;
    }

    const fd = new FormData();

    fd.append("patientId", selectedPatient._id);
    fd.append("title", report.title);
    fd.append("description", report.description);
    fd.append("report", report.file);

    try {
      await api.post("/reports/upload", fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Medical report uploaded.");

      setReport(emptyReport);
      setReportInputKey((k) => k + 1);

      openPatient(selectedPatient);
      fetchDashboard();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        "Report upload failed.",
      );
    }
  };

  // =====================================================
  // BLOG MANAGEMENT
  // =====================================================

  const fetchBlogs = async (page = 1) => {
    setBlogLoading(true);

    try {
      const res = await api.get(
        `/blog/my/blogs?page=${page}&limit=6`,
      );

      setBlogs(res.data.blogs || []);

      setBlogPagination(
        res.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalBlogs: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        "Unable to load your blogs.",
      );
    } finally {
      setBlogLoading(false);
    }
  };

  const handleBlogChange = (e) => {
    const { name, value, type, checked } = e.target;

    setBlogForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetBlogForm = () => {
    setBlogForm(emptyBlog);
    setEditingBlogId(null);
    setShowBlogForm(false);
  };

  const startCreateBlog = () => {
    setEditingBlogId(null);
    setBlogForm(emptyBlog);
    setShowBlogForm(true);
  };

  const startEditBlog = (blog) => {
    setEditingBlogId(blog._id);

    setBlogForm({
      title: blog.title || "",
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      category: blog.category || "Women's Health",
      tags: Array.isArray(blog.tags)
        ? blog.tags.join(", ")
        : "",
      featuredImage: blog.featuredImage || "",
      isPublished: blog.isPublished !== false,
    });

    setShowBlogForm(true);
  };

  const saveBlog = async (e) => {
    e.preventDefault();

    if (!blogForm.title.trim()) {
      toast.error("Please enter a blog title.");
      return;
    }

    if (!blogForm.content.trim()) {
      toast.error("Please enter blog content.");
      return;
    }

    setBlogSaving(true);

    try {
      const payload = {
        title: blogForm.title.trim(),
        excerpt: blogForm.excerpt.trim(),
        content: blogForm.content.trim(),
        category:
          blogForm.category.trim() ||
          "Women's Health",
        tags: blogForm.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        featuredImage:
          blogForm.featuredImage.trim(),
        isPublished: blogForm.isPublished,
      };

      if (editingBlogId) {
        await api.patch(
          `/blog/${editingBlogId}`,
          payload,
        );

        toast.success("Blog updated successfully.");
      } else {
        await api.post("/blog", payload);

        toast.success("Blog published successfully.");
      }

      resetBlogForm();

      if (blogPage === 1) {
        fetchBlogs(1);
      } else {
        setBlogPage(1);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        "Unable to save blog.",
      );
    } finally {
      setBlogSaving(false);
    }
  };

  const deleteBlog = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this blog?",
    );

    if (!confirmed) return;

    try {
      await api.delete(`/blog/${id}`);

      toast.success("Blog deleted successfully.");

      if (editingBlogId === id) {
        resetBlogForm();
      }

      if (blogs.length === 1 && blogPage > 1) {
        setBlogPage((page) => page - 1);
      } else {
        fetchBlogs(blogPage);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        "Unable to delete blog.",
      );
    }
  };

  const toggleBlogPublish = async (blog) => {
    try {
      await api.patch(`/blog/${blog._id}`, {
        isPublished: !blog.isPublished,
      });

      toast.success(
        blog.isPublished
          ? "Blog unpublished."
          : "Blog published.",
      );

      fetchBlogs(blogPage);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        "Unable to update blog status.",
      );
    }
  };



  // =====================================================
  // WEBSITE MANAGEMENT
  // =====================================================

  const fetchWebsiteSettings = async () => {
    setWebsiteLoading(true);
    try {
      const res = await api.get("/website-settings");
      setWebsiteSettings(res.data.settings || null);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Unable to load website settings.",
      );
    } finally {
      setWebsiteLoading(false);
    }
  };

  const updateWebsiteSection = (section, field, value) => {
    setWebsiteSettings((prev) => ({
      ...prev,
      [section]: {
        ...(prev?.[section] || {}),
        [field]: value,
      },
    }));
  };

  const updateHeroSlide = (index, field, value) => {
    setWebsiteSettings((prev) => {
      const heroSlides = [...(prev?.heroSlides || [])];
      heroSlides[index] = { ...heroSlides[index], [field]: value };
      return { ...prev, heroSlides };
    });
  };

  const addHeroSlide = () => {
    setWebsiteSettings((prev) => ({
      ...prev,
      heroSlides: [
        ...(prev?.heroSlides || []),
        { eyebrow: "", title: "New Hero Slide", text: "", image: "", isActive: true },
      ],
    }));
  };

  const removeHeroSlide = (index) => {
    setWebsiteSettings((prev) => ({
      ...prev,
      heroSlides: (prev?.heroSlides || []).filter((_, i) => i !== index),
    }));
  };

  const updateService = (index, field, value) => {
    setWebsiteSettings((prev) => {
      const services = [...(prev?.services || [])];
      services[index] = { ...services[index], [field]: value };
      return { ...prev, services };
    });
  };

  const addService = () => {
    setWebsiteSettings((prev) => ({
      ...prev,
      services: [
        ...(prev?.services || []),
        { title: "New Service", description: "", slug: `service-${Date.now()}`, image: "", isActive: true },
      ],
    }));
  };

  const removeService = (index) => {
    setWebsiteSettings((prev) => ({
      ...prev,
      services: (prev?.services || []).filter((_, i) => i !== index),
    }));
  };

  const saveWebsiteSettings = async () => {
    if (!websiteSettings) return;
    setWebsiteSaving(true);
    try {
      const payload = {
        heroSlides: websiteSettings.heroSlides || [],
        about: websiteSettings.about || {},
        doctor: websiteSettings.doctor || {},
        services: websiteSettings.services || [],
        contact: websiteSettings.contact || {},
        theme: websiteSettings.theme || {},
      };
      const res = await api.patch("/website-settings", payload);
      setWebsiteSettings(res.data.settings || websiteSettings);
      toast.success("Website changes saved successfully.");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Unable to save website settings.",
      );
    } finally {
      setWebsiteSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        Loading doctor dashboard...
      </div>
    );
  }

  const stats = data?.stats || {};
  const appointments = appointmentData;

  return (
    <div className="min-h-screen bg-primary-light py-8">
      <div className="max-w-7xl mx-auto px-4">

        {/* =================================================
            HEADER
        ================================================== */}

        <div className="mb-8">
          <p className="section-label">
            Admin & Doctor Workspace
          </p>

          <h1 className="mt-3 text-3xl font-bold text-accent-navy">
            Doctor Dashboard
          </h1>

          <p className="mt-2 text-text-light">
            Manage appointments, payments, patients,
            prescriptions, medical reports and blogs
            from one place.
          </p>
        </div>

        {/* =================================================
            STATS
        ================================================== */}

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            [
              Users,
              stats.totalPatients,
              "Patients",
            ],
            [
              Calendar,
              stats.totalAppointments,
              "Appointments",
            ],
            [
              Clock,
              stats.pendingAppointments,
              "Pending",
            ],
            [
              CheckCircle,
              stats.completedAppointments,
              "Completed",
            ],
            [
              DollarSign,
              `Rs ${stats.totalRevenuePKR || 0
              } / $${stats.totalRevenueUSD || 0
              }`,
              "Verified Revenue",
            ],
          ].map(([Icon, value, label]) => (
            <div className="card" key={label}>
              <Icon className="w-7 h-7 text-accent-navy mb-3" />

              <p className="text-xl font-bold text-accent-navy">
                {value || 0}
              </p>

              <p className="text-sm text-text-light">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* =================================================
            APPOINTMENTS + PATIENTS
        ================================================== */}

        <div className="grid lg:grid-cols-3 gap-6">

          {/* APPOINTMENTS */}

          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-accent-navy flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                All Recent Appointments
              </h2>
            </div>

            {appointments.length === 0 ? (
              <p className="text-text-light py-8 text-center">
                No appointments yet.
              </p>
            ) : (
              <div className="space-y-3">
                {appointments.map((apt) => (
                  <div
                    key={apt._id}
                    className="border border-slate-100 rounded-xl p-4"
                  >
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">

                      <div>
                        <p className="font-semibold text-accent-navy">
                          {apt.patient?.name ||
                            "Patient"}
                        </p>

                        <p className="text-sm text-text-light">
                          {apt.patient?.country} •{" "}
                          {apt.patient?.email}
                        </p>

                        <p className="text-sm mt-1">
                          {new Date(
                            apt.appointmentDate,
                          ).toLocaleDateString()}{" "}
                          at {apt.appointmentTime}
                        </p>

                        <p className="text-sm text-text-light mt-1">
                          {apt.consultationFee}{" "}
                          {apt.currency} •{" "}
                          {apt.paymentMethod}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">

                        {apt.payment?.status ===
                          "Pending" && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  openSecureFile(`/payments/${apt.payment._id}/slip`)
                                }
                                className="px-3 py-2 rounded-lg bg-secondary-sage text-accent-navy text-xs font-semibold"
                              >
                                View Slip
                              </button>

                              <button
                                onClick={() =>
                                  verifyPayment(
                                    apt.payment._id,
                                    "Successful",
                                  )
                                }
                                className="px-3 py-2 rounded-lg bg-green-600 text-white text-xs font-semibold"
                              >
                                Verify Payment
                              </button>

                              <button
                                onClick={() =>
                                  verifyPayment(
                                    apt.payment._id,
                                    "Failed",
                                  )
                                }
                                className="px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold"
                              >
                                Reject Payment
                              </button>
                            </>
                          )}

                        {apt.appointmentStatus ===
                          "pending" &&
                          apt.payment?.status ===
                          "Successful" && (
                            <button
                              onClick={() =>
                                updateAppointment(
                                  apt._id,
                                  "confirmed",
                                )
                              }
                              className="px-3 py-2 rounded-lg bg-accent-navy text-white text-xs font-semibold"
                            >
                              Confirm Appointment
                            </button>
                          )}

                        {apt.appointmentStatus ===
                          "confirmed" && (
                            <button
                              onClick={() =>
                                updateAppointment(
                                  apt._id,
                                  "completed",
                                )
                              }
                              className="px-3 py-2 rounded-lg bg-accent-sage text-white text-xs font-semibold"
                            >
                              Complete
                            </button>
                          )}

                        {apt.appointmentStatus ===
                          "pending" &&
                          apt.payment?.status !==
                          "Successful" && (
                            <span className="px-3 py-2 rounded-lg bg-yellow-100 text-yellow-800 text-xs font-semibold">
                              Payment Verification
                              Pending
                            </span>
                          )}

                        <button
                          onClick={() =>
                            apt.patient &&
                            openPatient(
                              apt.patient,
                            )
                          }
                          className="px-3 py-2 rounded-lg bg-secondary-pink text-accent-navy text-xs font-semibold"
                        >
                          Patient History
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                disabled={!appointmentPagination.hasPreviousPage}
                onClick={() =>
                  setAppointmentPage((page) =>
                    Math.max(page - 1, 1),
                  )
                }
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-accent-navy transition hover:bg-primary-light disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                Previous
              </button>

              <div className="text-center">
                <p className="text-sm font-semibold text-accent-navy">
                  Page {appointmentPagination.currentPage} of{" "}
                  {appointmentPagination.totalPages}
                </p>
                <p className="text-xs text-text-light mt-1">
                  {appointmentPagination.totalAppointments}{" "}
                  {appointmentPagination.totalAppointments === 1
                    ? "appointment"
                    : "appointments"}
                </p>
              </div>

              <button
                type="button"
                disabled={!appointmentPagination.hasNextPage}
                onClick={() =>
                  setAppointmentPage((page) => page + 1)
                }
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-accent-navy transition hover:bg-primary-light disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                Next
              </button>
            </div>
          </div>

          {/* PATIENTS */}

          <div className="card">
            <h2 className="text-xl font-semibold text-accent-navy flex items-center gap-2 mb-4">
              <Users className="w-5 h-5" />
              Patients
            </h2>

            <div className="flex gap-2 mb-4">
              <input
                className="input-field"
                placeholder="Search patient..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <button
                type="button"
                className="px-3 rounded-lg bg-secondary-sage"
                aria-label="Search patients"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-auto">
              {patients.length === 0 ? (
                <p className="py-6 text-center text-sm text-text-light">
                  No patients found.
                </p>
              ) : (
                patients.map((p) => (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => openPatient(p)}
                    className={`w-full text-left p-3 rounded-xl transition ${
                      selectedPatient?._id === p._id
                        ? "bg-secondary-pink"
                        : "bg-primary-light hover:bg-secondary-sage"
                    }`}
                  >
                    <p className="font-semibold text-accent-navy">
                      {p.name}
                    </p>

                    <p className="text-xs text-text-light">
                      {p.email} • {p.country}
                    </p>
                  </button>
                ))
              )}
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                disabled={!patientPagination.hasPreviousPage}
                onClick={() =>
                  setPatientPage((page) =>
                    Math.max(page - 1, 1),
                  )
                }
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-accent-navy transition hover:bg-primary-light disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                Previous
              </button>

              <div className="text-center">
                <p className="text-sm font-semibold text-accent-navy">
                  Page {patientPagination.currentPage} of{" "}
                  {patientPagination.totalPages}
                </p>

                <p className="text-xs text-text-light mt-1">
                  {patientPagination.totalPatients}{" "}
                  {patientPagination.totalPatients === 1
                    ? "patient"
                    : "patients"}
                </p>
              </div>

              <button
                type="button"
                disabled={!patientPagination.hasNextPage}
                onClick={() =>
                  setPatientPage((page) => page + 1)
                }
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-accent-navy transition hover:bg-primary-light disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* =================================================
            PATIENT HISTORY
        ================================================== */}

        {selectedPatient && (
          <section className="mt-6 grid lg:grid-cols-3 gap-6">

            <div className="lg:col-span-2 card">

              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-sm text-accent-sage font-semibold">
                    Complete Patient History
                  </p>

                  <h2 className="text-2xl font-bold text-accent-navy">
                    {selectedPatient.name}
                  </h2>

                  <p className="text-sm text-text-light">
                    {selectedPatient.email} •{" "}
                    {selectedPatient.phone} •{" "}
                    {selectedPatient.country}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedPatient(null);
                    setHistory(null);
                  }}
                >
                  <XCircle className="w-5 h-5 text-text-light" />
                </button>
              </div>

              {historyLoading ? (
                <p className="py-10 text-center">
                  Loading history...
                </p>
              ) : (
                history && (
                  <div className="space-y-6">

                    {/* APPOINTMENTS */}

                    <div>
                      <h3 className="font-semibold text-accent-navy mb-2">
                        Appointments
                      </h3>

                      {history.appointments
                        .length === 0 ? (
                        <p className="text-sm text-text-light">
                          No appointments.
                        </p>
                      ) : (
                        history.appointments.map(
                          (a) => (
                            <div
                              key={a._id}
                              className="p-3 rounded-lg bg-primary-light mb-2"
                            >
                              <p className="font-medium">
                                {new Date(
                                  a.appointmentDate,
                                ).toLocaleDateString()}{" "}
                                •{" "}
                                {
                                  a.appointmentTime
                                }
                              </p>

                              <p className="text-sm text-text-light">
                                {a.reason} •{" "}
                                {
                                  a.appointmentStatus
                                }{" "}
                                • Payment{" "}
                                {
                                  a.paymentStatus
                                }
                              </p>
                            </div>
                          ),
                        )
                      )}
                    </div>

                    {/* PRESCRIPTIONS */}

                    <div>
                      <h3 className="font-semibold text-accent-navy mb-2 flex gap-2 items-center">
                        <Pill className="w-4 h-4" />
                        Prescriptions
                      </h3>

                      {history.prescriptions
                        .length === 0 ? (
                        <p className="text-sm text-text-light">
                          No prescriptions.
                        </p>
                      ) : (
                        history.prescriptions.map(
                          (p) => (
                            <div
                              key={p._id}
                              className="p-4 rounded-lg bg-secondary-sage/40 mb-2"
                            >
                              <p className="font-semibold">
                                {p.diagnosis}
                              </p>

                              <p className="text-sm mt-1">
                                {p.recommendations}
                              </p>

                              {p.medicines.map(
                                (m, i) => (
                                  <p
                                    key={i}
                                    className="text-sm mt-1"
                                  >
                                    • {m.name} —{" "}
                                    {m.dosage},{" "}
                                    {
                                      m.frequency
                                    }
                                    ,{" "}
                                    {m.duration}
                                  </p>
                                ),
                              )}

                              {p.doctorNotes && (
                                <p className="text-xs text-text-light mt-2">
                                  {
                                    p.doctorNotes
                                  }
                                </p>
                              )}
                            </div>
                          ),
                        )
                      )}
                    </div>

                    {/* MEDICAL REPORTS */}

                    <div>
                      <h3 className="font-semibold text-accent-navy mb-2 flex gap-2 items-center">
                        <FileText className="w-4 h-4" />
                        Medical Reports
                      </h3>

                      {history.reports.length ===
                        0 ? (
                        <p className="text-sm text-text-light">
                          No reports.
                        </p>
                      ) : (
                        history.reports.map(
                          (r) => (
                            <button
  key={r._id}
  type="button"
  onClick={() =>
    openSecureFile(`/reports/${r._id}/file`)
  }
  className="block w-full text-left p-3 rounded-lg bg-secondary-pink/50 mb-2 hover:bg-secondary-pink"
>
  <p className="font-medium">
    {r.title}
  </p>

  <p className="text-xs text-text-light">
    {r.fileName} • uploaded by {r.uploadedByRole}
  </p>
</button>
                          ),
                        )
                      )}
                    </div>
                  </div>
                )
              )}
            </div>

            {/* RIGHT SIDE */}

            <div className="space-y-6">

              {/* PRESCRIPTION */}

              <div className="card">
                <h3 className="font-semibold text-accent-navy flex items-center gap-2">
                  <Pill className="w-5 h-5" />
                  Add Prescription
                </h3>

                <div className="space-y-3 mt-4">

                  <input
                    className="input-field"
                    placeholder="Diagnosis"
                    value={prescription.diagnosis}
                    onChange={(e) =>
                      setPrescription({
                        ...prescription,
                        diagnosis:
                          e.target.value,
                      })
                    }
                  />

                  {prescription.medicines.map(
                    (m, i) => (
                      <div
                        key={i}
                        className="p-3 bg-primary-light rounded-lg space-y-2"
                      >
                        {[
                          "name",
                          "dosage",
                          "frequency",
                          "duration",
                        ].map((field) => (
                          <input
                            key={field}
                            className="input-field"
                            placeholder={
                              field[0].toUpperCase() +
                              field.slice(1)
                            }
                            value={m[field]}
                            onChange={(e) =>
                              updateMedicine(
                                i,
                                field,
                                e.target.value,
                              )
                            }
                          />
                        ))}

                        <input
                          className="input-field"
                          placeholder="Instructions"
                          value={
                            m.instructions
                          }
                          onChange={(e) =>
                            updateMedicine(
                              i,
                              "instructions",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    ),
                  )}

                  <button
                    onClick={addMedicine}
                    className="text-sm text-accent-navy font-semibold"
                  >
                    + Add another medicine
                  </button>

                  <textarea
                    className="input-field"
                    placeholder="Doctor notes"
                    value={
                      prescription.doctorNotes
                    }
                    onChange={(e) =>
                      setPrescription({
                        ...prescription,
                        doctorNotes:
                          e.target.value,
                      })
                    }
                  />

                  <textarea
                    className="input-field"
                    placeholder="Recommendations / last advice"
                    value={
                      prescription.recommendations
                    }
                    onChange={(e) =>
                      setPrescription({
                        ...prescription,
                        recommendations:
                          e.target.value,
                      })
                    }
                  />

                  <input
                    type="date"
                    className="input-field"
                    value={
                      prescription.followUpDate
                    }
                    onChange={(e) =>
                      setPrescription({
                        ...prescription,
                        followUpDate:
                          e.target.value,
                      })
                    }
                  />

                  <button
                    onClick={() =>
                      createPrescription(
                        history?.appointments?.[0],
                      )
                    }
                    className="w-full btn-primary"
                  >
                    Save Prescription
                  </button>
                </div>
              </div>

              {/* REPORT */}

              <div className="card">
                <h3 className="font-semibold text-accent-navy flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Patient Report
                </h3>

                <form
                  onSubmit={uploadReport}
                  className="space-y-3 mt-4"
                >
                  <input
                    className="input-field"
                    placeholder="Report title"
                    value={report.title}
                    onChange={(e) =>
                      setReport({
                        ...report,
                        title: e.target.value,
                      })
                    }
                  />

                  <textarea
                    className="input-field"
                    placeholder="Description"
                    value={
                      report.description
                    }
                    onChange={(e) =>
                      setReport({
                        ...report,
                        description:
                          e.target.value,
                      })
                    }
                  />

                  <input
                    key={reportInputKey}
                    id="doctorReportFile"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];

                      if (!file) return;

                      const result = validateUploadFile(file);

                      if (!result.valid) {
                        toast.error(result.message);
                        e.target.value = "";
                        return;
                      }

                      setReport({
                        ...report,
                        file,
                      });
                    }}
                  />

                  <p className="text-xs text-text-light">
                    Allowed formats: JPG, JPEG, PNG — Max size 50KB
                  </p>

                  <button className="w-full btn-secondary">
                    <Upload className="w-4 h-4 inline mr-2" />
                    Upload Report
                  </button>
                </form>
              </div>
            </div>
          </section>
        )}



        {/* =================================================
            WEBSITE MANAGEMENT
        ================================================== */}
        <section className="mt-8 card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <p className="section-label">Website CMS</p>
              <h2 className="mt-2 text-2xl font-bold text-accent-navy flex items-center gap-2">
                <Settings className="w-6 h-6" /> Website Management
              </h2>
              <p className="text-sm text-text-light mt-1">Edit public website content and theme without changing code.</p>
            </div>
            <button type="button" onClick={saveWebsiteSettings} disabled={websiteSaving || websiteLoading || !websiteSettings} className="btn-primary inline-flex items-center gap-2 disabled:opacity-60">
              <Save className="w-4 h-4" /> {websiteSaving ? "Saving..." : "Save Website Changes"}
            </button>
          </div>

          {websiteLoading ? (
            <div className="py-10 text-center text-text-light">Loading website settings...</div>
          ) : !websiteSettings ? (
            <div className="py-10 text-center text-text-light">Website settings could not be loaded.</div>
          ) : (
            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="text-lg font-bold text-accent-navy">Hero Slides</h3>
                  <button type="button" onClick={addHeroSlide} className="appointment-btn"><Plus className="w-4 h-4" /> Add Slide</button>
                </div>
                <div className="space-y-4">
                  {(websiteSettings.heroSlides || []).map((slide, index) => (
                    <div key={slide._id || index} className="rounded-2xl border border-slate-200 p-4 bg-primary-light">
                      <div className="grid md:grid-cols-2 gap-3">
                        <input className="input-field" placeholder="Eyebrow" value={slide.eyebrow || ""} onChange={(e) => updateHeroSlide(index, "eyebrow", e.target.value)} />
                        <input className="input-field" placeholder="Title" value={slide.title || ""} onChange={(e) => updateHeroSlide(index, "title", e.target.value)} />
                        <input className="input-field md:col-span-2" placeholder="Image path or HTTPS URL" value={slide.image || ""} onChange={(e) => updateHeroSlide(index, "image", e.target.value)} />
                        <textarea className="input-field md:col-span-2" rows="3" placeholder="Description" value={slide.text || ""} onChange={(e) => updateHeroSlide(index, "text", e.target.value)} />
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm font-medium text-accent-navy"><input type="checkbox" checked={slide.isActive !== false} onChange={(e) => updateHeroSlide(index, "isActive", e.target.checked)} /> Active</label>
                        <button type="button" onClick={() => removeHeroSlide(index)} className="px-3 py-2 rounded-lg bg-red-100 text-red-700 text-xs font-semibold inline-flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-lg font-bold text-accent-navy mb-4">About Section</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {[['eyebrow','Eyebrow'],['title','Title'],['highlight','Highlighted Title'],['image','Image Path / HTTPS URL']].map(([field,label]) => (
                    <div key={field}><label className="block text-sm font-semibold text-accent-navy mb-1">{label}</label><input className="input-field" value={websiteSettings.about?.[field] || ""} onChange={(e) => updateWebsiteSection("about", field, e.target.value)} /></div>
                  ))}
                  <textarea className="input-field md:col-span-2" rows="3" placeholder="First paragraph" value={websiteSettings.about?.description1 || ""} onChange={(e) => updateWebsiteSection("about", "description1", e.target.value)} />
                  <textarea className="input-field md:col-span-2" rows="3" placeholder="Second paragraph" value={websiteSettings.about?.description2 || ""} onChange={(e) => updateWebsiteSection("about", "description2", e.target.value)} />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-lg font-bold text-accent-navy mb-4">Doctor Information</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <input className="input-field" placeholder="Doctor name" value={websiteSettings.doctor?.name || ""} onChange={(e) => updateWebsiteSection("doctor", "name", e.target.value)} />
                  <input className="input-field" placeholder="Specialty" value={websiteSettings.doctor?.specialty || ""} onChange={(e) => updateWebsiteSection("doctor", "specialty", e.target.value)} />
                  <textarea className="input-field md:col-span-2" rows="2" placeholder="Qualifications" value={websiteSettings.doctor?.qualifications || ""} onChange={(e) => updateWebsiteSection("doctor", "qualifications", e.target.value)} />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="text-lg font-bold text-accent-navy">Services</h3>
                  <button type="button" onClick={addService} className="appointment-btn"><Plus className="w-4 h-4" /> Add Service</button>
                </div>
                <div className="grid lg:grid-cols-2 gap-4">
                  {(websiteSettings.services || []).map((service, index) => (
                    <div key={service._id || index} className="rounded-2xl border border-slate-200 p-4">
                      <div className="space-y-3">
                        <input className="input-field" placeholder="Service title" value={service.title || ""} onChange={(e) => updateService(index, "title", e.target.value)} />
                        <input className="input-field" placeholder="Slug" value={service.slug || ""} onChange={(e) => updateService(index, "slug", e.target.value)} />
                        <input className="input-field" placeholder="Image path / HTTPS URL" value={service.image || ""} onChange={(e) => updateService(index, "image", e.target.value)} />
                        <textarea className="input-field" rows="3" placeholder="Description" value={service.description || ""} onChange={(e) => updateService(index, "description", e.target.value)} />
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 text-sm font-medium text-accent-navy"><input type="checkbox" checked={service.isActive !== false} onChange={(e) => updateService(index, "isActive", e.target.checked)} /> Active</label>
                          <button type="button" onClick={() => removeService(index)} className="px-3 py-2 rounded-lg bg-red-100 text-red-700 text-xs font-semibold inline-flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-lg font-bold text-accent-navy mb-4">Contact Information</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {[['phone','Phone'],['email','Email'],['address','Address'],['clinicHours','Clinic Hours']].map(([field,label]) => (
                    <div key={field}><label className="block text-sm font-semibold text-accent-navy mb-1">{label}</label><input className="input-field" value={websiteSettings.contact?.[field] || ""} onChange={(e) => updateWebsiteSection("contact", field, e.target.value)} /></div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-lg font-bold text-accent-navy mb-4 flex items-center gap-2"><Palette className="w-5 h-5" /> Theme & Typography</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[['primaryColor','Primary'],['secondaryColor','Secondary'],['accentColor','Accent'],['textColor','Text']].map(([field,label]) => (
                    <label key={field} className="text-sm font-semibold text-accent-navy">{label} Color<div className="mt-1 flex gap-2"><input type="color" className="h-11 w-14 rounded border" value={websiteSettings.theme?.[field] || '#000000'} onChange={(e) => updateWebsiteSection("theme", field, e.target.value)} /><input className="input-field" value={websiteSettings.theme?.[field] || ""} onChange={(e) => updateWebsiteSection("theme", field, e.target.value)} /></div></label>
                  ))}
                </div>
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div><label className="block text-sm font-semibold text-accent-navy mb-1">Font Family</label><select className="input-field" value={websiteSettings.theme?.fontFamily || 'Inter'} onChange={(e) => updateWebsiteSection("theme", "fontFamily", e.target.value)}><option>Inter</option><option>Arial</option><option>Georgia</option><option>Verdana</option><option>Tahoma</option></select></div>
                  <div><label className="block text-sm font-semibold text-accent-navy mb-1">Heading Size (24-80px)</label><input type="number" min="24" max="80" className="input-field" value={websiteSettings.theme?.headingSize || 48} onChange={(e) => updateWebsiteSection("theme", "headingSize", Number(e.target.value))} /></div>
                  <div><label className="block text-sm font-semibold text-accent-navy mb-1">Body Size (12-24px)</label><input type="number" min="12" max="24" className="input-field" value={websiteSettings.theme?.bodySize || 16} onChange={(e) => updateWebsiteSection("theme", "bodySize", Number(e.target.value))} /></div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6 flex justify-end">
                <button type="button" onClick={saveWebsiteSettings} disabled={websiteSaving} className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"><Save className="w-4 h-4" /> {websiteSaving ? "Saving..." : "Save Website Changes"}</button>
              </div>
            </div>
          )}
        </section>

        {/* =================================================
            BLOG MANAGEMENT
        ================================================== */}

        <section className="mt-8 card">

          {/* BLOG HEADER */}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

            <div>
              <p className="section-label">
                Content Management
              </p>

              <h2 className="mt-2 text-2xl font-bold text-accent-navy flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Blog Management
              </h2>

              <p className="text-sm text-text-light mt-1">
                Create, edit, publish or remove
                women's health articles.
              </p>
            </div>

            <button
              onClick={startCreateBlog}
              className="appointment-btn"
            >
              <Plus className="w-4 h-4" />
              Create New Blog
            </button>
          </div>

          {/* BLOG FORM */}

          {showBlogForm && (
            <div
              ref={blogFormRef}
              className="scroll-mt-28 mb-8 p-5 rounded-2xl bg-primary-light border border-secondary-sage [overflow-anchor:none]"
            >

              <div className="flex items-center justify-between mb-5">

                <div>
                  <h3 className="text-xl font-bold text-accent-navy">
                    {editingBlogId
                      ? "Edit Blog"
                      : "Create New Blog"}
                  </h3>

                  <p className="text-sm text-text-light mt-1">
                    Add useful and trustworthy
                    women's health content.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetBlogForm}
                  className="p-2 rounded-lg hover:bg-white"
                >
                  <XCircle className="w-5 h-5 text-text-light" />
                </button>
              </div>

              <form
                onSubmit={saveBlog}
                className="space-y-4"
              >

                {/* TITLE */}

                <div>
                  <label className="block text-sm font-semibold text-accent-navy mb-1">
                    Blog Title *
                  </label>

                  <input
                    name="title"
                    className="input-field"
                    placeholder="e.g. Understanding PCOS: Symptoms and Care"
                    value={blogForm.title}
                    onChange={handleBlogChange}
                    required
                  />
                </div>

                {/* CATEGORY + IMAGE */}

                <div className="grid md:grid-cols-2 gap-4">

                  <div>
                    <label className="block text-sm font-semibold text-accent-navy mb-1">
                      Category
                    </label>

                    <input
                      name="category"
                      className="input-field"
                      placeholder="Women's Health"
                      value={
                        blogForm.category
                      }
                      onChange={handleBlogChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-accent-navy mb-1">
                      Featured Image URL
                    </label>

                    <input
                      name="featuredImage"
                      className="input-field"
                      placeholder="https://example.com/image.jpg"
                      value={
                        blogForm.featuredImage
                      }
                      onChange={handleBlogChange}
                    />
                  </div>
                </div>

                {/* EXCERPT */}

                <div>
                  <label className="block text-sm font-semibold text-accent-navy mb-1">
                    Short Excerpt
                  </label>

                  <textarea
                    name="excerpt"
                    rows="3"
                    className="input-field"
                    placeholder="A short summary shown on the blog cards..."
                    value={blogForm.excerpt}
                    onChange={handleBlogChange}
                  />
                </div>

                {/* CONTENT */}

                <div>
                  <label className="block text-sm font-semibold text-accent-navy mb-1">
                    Blog Content *
                  </label>

                  <RichTextEditor
                    value={blogForm.content}
                    onChange={(content) =>
                      setBlogForm((prev) => ({
                        ...prev,
                        content,
                      }))
                    }
                  />
                </div>

                {/* TAGS */}

                <div>
                  <label className="block text-sm font-semibold text-accent-navy mb-1">
                    Tags
                  </label>

                  <input
                    name="tags"
                    className="input-field"
                    placeholder="PCOS, Women's Health, Hormones"
                    value={blogForm.tags}
                    onChange={handleBlogChange}
                  />

                  <p className="text-xs text-text-light mt-1">
                    Separate multiple tags with commas.
                  </p>
                </div>

                {/* PUBLISH */}

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={
                      blogForm.isPublished
                    }
                    onChange={handleBlogChange}
                    className="w-4 h-4"
                  />

                  <span className="text-sm font-medium text-accent-navy">
                    Publish this blog immediately
                  </span>
                </label>

                {/* IMAGE PREVIEW */}

                {blogForm.featuredImage.trim() && (
                  <div>
                    <p className="text-sm font-semibold text-accent-navy mb-2">
                      Image Preview
                    </p>

                    <img
                      src={
                        blogForm.featuredImage
                      }
                      alt="Blog preview"
                      className="w-full max-w-md h-52 object-cover rounded-xl border border-slate-200"
                      onError={(e) => {
                        e.currentTarget.style.display =
                          "none";
                      }}
                    />
                  </div>
                )}

                {/* ACTIONS */}

                <div className="flex flex-wrap gap-3 pt-2">

                  <button
                    type="submit"
                    disabled={blogSaving}
                    className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
                  >
                    {editingBlogId ? (
                      <>
                        <Edit className="w-4 h-4" />
                        {blogSaving
                          ? "Updating..."
                          : "Update Blog"}
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        {blogSaving
                          ? "Publishing..."
                          : "Publish Blog"}
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={resetBlogForm}
                    className="px-5 py-2 rounded-lg border border-slate-200 bg-white text-accent-navy font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* BLOG LIST */}

          <div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-accent-navy">
                Your Blogs
              </h3>

              <span className="text-sm text-text-light">
                {blogPagination.totalBlogs}{" "}
                {blogPagination.totalBlogs === 1
                  ? "article"
                  : "articles"}
              </span>
            </div>

            {blogLoading ? (
              <div className="py-10 text-center text-text-light">
                Loading blogs...
              </div>
            ) : blogs.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-secondary-sage rounded-xl">
                <BookOpen className="w-10 h-10 mx-auto mb-3 text-accent-sage" />

                <p className="font-semibold text-accent-navy">
                  No blogs created yet.
                </p>

                <p className="text-sm text-text-light mt-1">
                  Create your first women's health
                  article.
                </p>

                <button
                  onClick={startCreateBlog}
                  className="mt-4 btn-primary inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Blog
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">

                {blogs.map((blog) => (
                  <article
                    key={blog._id}
                    className="border border-slate-100 rounded-2xl overflow-hidden bg-white"
                  >

                    {/* IMAGE */}

                    {blog.featuredImage ? (
                      <img
                        src={
                          blog.featuredImage
                        }
                        alt={blog.title}
                        className="w-full h-44 object-cover"
                      />
                    ) : (
                      <div className="w-full h-44 bg-secondary-pink flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-accent-navy/50" />
                      </div>
                    )}

                    <div className="p-5">

                      {/* STATUS */}

                      <div className="flex items-center justify-between gap-3 mb-2">

                        <span className="text-xs font-semibold text-accent-sage">
                          {blog.category ||
                            "General"}
                        </span>

                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${blog.isPublished
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                            }`}
                        >
                          {blog.isPublished
                            ? "Published"
                            : "Draft"}
                        </span>
                      </div>

                      {/* TITLE */}

                      <h4 className="text-lg font-bold text-accent-navy line-clamp-2">
                        {blog.title}
                      </h4>

                      {/* EXCERPT */}

                      {blog.excerpt && (
                        <p className="text-sm text-text-light mt-2 line-clamp-3">
                          {blog.excerpt}
                        </p>
                      )}

                      {/* DATE + VIEWS */}

                      {/* <div className="flex flex-wrap items-center gap-4 text-xs text-text-light mt-4">

                        <span>
                          {blog.createdAt
                            ? new Date(
                                blog.createdAt,
                              ).toLocaleDateString()
                            : ""}
                        </span>

                        <span>
                          {blog.views || 0} views
                        </span>
                      </div> */}

                      <div className="text-xs text-text-light mt-4">
                        Published by {blog.authorName || "Dr. Elite Gynaecologist"}
                      </div>

                      {/* ACTIONS */}

                      <div className="flex flex-wrap gap-2 mt-5">

                        <button
                          onClick={() =>
                            startEditBlog(blog)
                          }
                          className="px-3 py-2 rounded-lg bg-secondary-sage text-accent-navy text-xs font-semibold inline-flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            toggleBlogPublish(
                              blog,
                            )
                          }
                          className="px-3 py-2 rounded-lg bg-secondary-pink text-accent-navy text-xs font-semibold inline-flex items-center gap-1"
                        >
                          {blog.isPublished ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              Publish
                            </>
                          )}
                        </button>

                        {blog.slug && (
                          <a
                            href={`/blog/${blog.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-2 rounded-lg bg-primary-light text-accent-navy text-xs font-semibold inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </a>
                        )}

                        <button
                          onClick={() =>
                            deleteBlog(blog._id)
                          }
                          className="px-3 py-2 rounded-lg bg-red-100 text-red-700 text-xs font-semibold inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {!blogLoading && blogPagination.totalBlogs > 0 && (
              <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  disabled={!blogPagination.hasPreviousPage}
                  onClick={() =>
                    setBlogPage((page) =>
                      Math.max(page - 1, 1),
                    )
                  }
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-accent-navy transition hover:bg-primary-light disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                  Previous
                </button>

                <div className="text-center">
                  <p className="text-sm font-semibold text-accent-navy">
                    Page {blogPagination.currentPage} of{" "}
                    {blogPagination.totalPages}
                  </p>

                  <p className="text-xs text-text-light mt-1">
                    {blogPagination.totalBlogs}{" "}
                    {blogPagination.totalBlogs === 1
                      ? "article"
                      : "articles"}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={!blogPagination.hasNextPage}
                  onClick={() =>
                    setBlogPage((page) => page + 1)
                  }
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-accent-navy transition hover:bg-primary-light disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DoctorDashboard;