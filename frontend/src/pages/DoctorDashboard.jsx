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
  Home,
  Stethoscope,
  ClipboardList,
  Bell,
  BarChart3,
  UserCircle,
  LogOut,
  Menu,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

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


const emptyPatientForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  country: "Pakistan",
  dateOfBirth: "",
  gender: "female",
  address: "",
};

const emptyBlog = {
  title: "",
  excerpt: "",
  content: "",
  category: "Women's Health",
  tags: "",
  featuredImage: "",
  isPublished: true,
  seo: {
    focusKeyword: "",
    seoTitle: "",
    metaDescription: "",
    canonicalUrl: "",
    indexPage: true,
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    schemaType: "Article",
  },
};

const getServiceSeoAnalysis = (service = {}) => {
  const keyword = String(service.primaryKeyword || "").trim().toLowerCase();
  const title = String(service.seoTitle || service.title || "").trim();
  const description = String(service.metaDescription || service.description || "").trim();
  const slug = String(service.slug || "").trim().toLowerCase();
  const pageText = `${service.title || ""} ${service.description || ""}`.toLowerCase();

  const containsKeyword = (value) =>
    Boolean(keyword) && String(value || "").toLowerCase().includes(keyword);

  const checks = [
    { label: "Primary keyword is set", passed: Boolean(keyword) },
    { label: "Keyword appears in SEO title", passed: containsKeyword(title) },
    { label: "Keyword appears in meta description", passed: containsKeyword(description) },
    { label: "Keyword appears in service URL", passed: containsKeyword(slug) },
    { label: "Keyword appears in service content", passed: containsKeyword(pageText) },
    { label: "SEO title length is 30–60 characters", passed: title.length >= 30 && title.length <= 60 },
    { label: "Meta description length is 120–160 characters", passed: description.length >= 120 && description.length <= 160 },
    { label: "Image alt text is provided", passed: Boolean(String(service.imageAlt || "").trim()) },
    { label: "Canonical URL is provided", passed: Boolean(String(service.canonicalUrl || "").trim()) },
  ];

  const passed = checks.filter((check) => check.passed).length;
  const score = Math.round((passed / checks.length) * 100);

  return { checks, score, title, description };
};

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState("home");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [data, setData] = useState(null);
  const [patients, setPatients] = useState([]);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState(null);
  const [patientForm, setPatientForm] = useState(emptyPatientForm);
  const [patientSaving, setPatientSaving] = useState(false);
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
  const [seoTab, setSeoTab] = useState("general");
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
  const [cmsTab, setCmsTab] = useState("content");
const [cmsContentTab, setCmsContentTab] = useState("hero");
const [selectedServiceIndex, setSelectedServiceIndex] = useState(0);
const [serviceEditorTab, setServiceEditorTab] = useState("content");
const [serviceSeoTab, setServiceSeoTab] = useState("general");
const [websiteSeoTab, setWebsiteSeoTab] = useState("general");

  // =========================
  // NOTIFICATION STATES
  // =========================
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const sidebarItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "patients", label: "Patients", icon: Users },
    { id: "medical-records", label: "Medical Records", icon: ClipboardList },
    { id: "prescriptions", label: "Prescriptions", icon: Pill },
    { id: "payments", label: "Payments", icon: DollarSign },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "blogs", label: "Blogs", icon: BookOpen },
    { id: "website", label: "Website CMS", icon: Settings },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "profile", label: "Profile", icon: UserCircle },
  ];

  const handleDoctorLogout = async () => {
    await logout();
    window.location.href = "/login";
  };


  useEffect(() => {
    fetchDashboard();
    fetchAppointments(1);
    fetchBlogs(1);
    fetchWebsiteSettings();
    fetchNotifications();
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
  // NOTIFICATIONS
  // =========================
  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const res = await api.get("/notifications");
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.notifications || [];
      setNotifications(list);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Unable to load notifications.");
    } finally {
      setNotificationsLoading(false);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      const res = await api.patch(`/notifications/${id}/read`);
      const updated = res.data?.notification || res.data;
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, ...updated, isRead: true } : item
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to mark notification as read.");
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      toast.success("All notifications marked as read.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to mark all notifications as read.");
    }
  };

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

  const startCreatePatient = () => {
    setEditingPatientId(null);
    setPatientForm(emptyPatientForm);
    setShowPatientForm(true);
  };

  const startEditPatient = (patient) => {
    setEditingPatientId(patient._id);
    setPatientForm({
      name: patient.name || "",
      email: patient.email || "",
      password: "",
      phone: patient.phone || "",
      country: patient.country || "Pakistan",
      dateOfBirth: patient.dateOfBirth
        ? new Date(patient.dateOfBirth).toISOString().slice(0, 10)
        : "",
      gender: patient.gender || "female",
      address: patient.address || "",
    });
    setShowPatientForm(true);
  };

  const resetPatientForm = () => {
    setEditingPatientId(null);
    setPatientForm(emptyPatientForm);
    setShowPatientForm(false);
  };

  const handlePatientFormChange = (e) => {
    const { name, value } = e.target;
    setPatientForm((prev) => ({ ...prev, [name]: value }));
  };

  const savePatient = async (e) => {
    e.preventDefault();

    if (
      !patientForm.name.trim() ||
      !patientForm.phone.trim()
    ) {
      toast.error("Name and phone are required.");
      return;
    }

    setPatientSaving(true);

    try {
      const payload = {
        name: patientForm.name.trim(),
        email: patientForm.email.trim(),
        phone: patientForm.phone.trim(),
        country: patientForm.country.trim() || "Pakistan",
        dateOfBirth: patientForm.dateOfBirth || undefined,
        gender: patientForm.gender || undefined,
        address: patientForm.address.trim(),
      };


      let savedPatient;

      if (editingPatientId) {
        const res = await api.patch(`/patients/${editingPatientId}`, payload);
        savedPatient = res.data.patient;
        toast.success("Patient updated successfully.");
      } else {
        const res = await api.post("/patients", payload);
        savedPatient = res.data.patient;
        toast.success("Patient added successfully.");
      }

      resetPatientForm();
      setPatientPage(1);
      await fetchPatients(search, 1);
      await fetchDashboard();

      if (savedPatient && selectedPatient?._id === savedPatient._id) {
        await openPatient(savedPatient);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          (editingPatientId
            ? "Unable to update patient."
            : "Unable to add patient."),
      );
    } finally {
      setPatientSaving(false);
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
      seo: {
        ...emptyBlog.seo,
        ...(blog.seo || {}),
      },
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
        seo: {
          ...blogForm.seo,
          focusKeyword: blogForm.seo.focusKeyword.trim(),
          seoTitle: blogForm.seo.seoTitle.trim(),
          metaDescription: blogForm.seo.metaDescription.trim(),
          canonicalUrl: blogForm.seo.canonicalUrl.trim(),
          ogTitle: blogForm.seo.ogTitle.trim(),
          ogDescription: blogForm.seo.ogDescription.trim(),
          ogImage: blogForm.seo.ogImage.trim(),
        },
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

  const updateSeoField = (field, value) => {
    setWebsiteSettings((prev) => ({
      ...prev,
      seo: {
        ...(prev?.seo || {}),
        [field]: value,
      },
    }));
  };

  const updateSeoNestedField = (section, field, value) => {
    setWebsiteSettings((prev) => ({
      ...prev,
      seo: {
        ...(prev?.seo || {}),
        [section]: {
          ...(prev?.seo?.[section] || {}),
          [field]: value,
        },
      },
    }));
  };

  const commaStringToArray = (value) =>
    value.split(",").map((item) => item.trim()).filter(Boolean);

  const updateContentStyle = (section, element, field, value) => {
    setWebsiteSettings((prev) => ({
      ...prev,
      contentStyles: {
        ...(prev?.contentStyles || {}),
        [section]: {
          ...(prev?.contentStyles?.[section] || {}),
          [element]: {
            ...(prev?.contentStyles?.[section]?.[element] || {}),
            [field]: value,
          },
        },
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
        { eyebrow: "", title: "New Hero Slide", text: "", image: "", imageAlt: "", isActive: true },
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
        { title: "New Service", description: "", slug: `service-${Date.now()}`, image: "", imageAlt: "", seoTitle: "", metaDescription: "", metaKeywords: [], primaryKeyword: "", secondaryKeywords: [], canonicalUrl: "", indexPage: true, ogTitle: "", ogDescription: "", ogImage: "", isActive: true },
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
        contentStyles: websiteSettings.contentStyles || {},
        seo: websiteSettings.seo || {},
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
    <div className="min-h-screen bg-primary-light overflow-x-hidden">
      <div className="flex min-h-screen min-w-0">
        {/* MOBILE TOP BAR */}
        <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between bg-accent-navy px-4 text-white shadow-md lg:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-white p-1">
              <img src="/logo-mark-v2.png" alt="Elite Gynaecology" className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">Elite Gynaecology</p>
              <p className="text-[11px] text-white/60">Doctor Workspace</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="rounded-xl border border-white/15 bg-white/10 p-2.5 hover:bg-white/20"
            aria-label="Open dashboard menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* MOBILE SIDEBAR BACKDROP */}
        {mobileSidebarOpen && (
          <button
            type="button"
            aria-label="Close dashboard menu"
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/45 lg:hidden"
          />
        )}

        <aside className={`fixed inset-y-0 left-0 z-50 w-[82vw] max-w-72 shrink-0 bg-accent-navy text-white shadow-2xl transition-transform duration-300 lg:sticky lg:top-0 lg:z-20 lg:w-56 lg:max-w-none lg:translate-x-0 lg:shadow-none ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="sticky top-0 h-screen flex flex-col">
            <div className="flex justify-end px-3 pt-3 lg:hidden">
              <button type="button" onClick={() => setMobileSidebarOpen(false)} className="rounded-lg p-2 text-white/80 hover:bg-white/10" aria-label="Close dashboard menu">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="px-5 pb-5 pt-2 border-b border-white/10 lg:px-6 lg:py-7">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center overflow-hidden">
  <img
    src="/logo-mark-v2.png"
    alt="Elite Gynaecology"
    className="w-full h-full object-contain p-1"
  />
</div>
                <div>
  <h2 className="font-bold text-base leading-tight">
    Elite Gynaecology
  </h2>

  <p className="text-xs text-white/60 mt-1">
    Doctor Workspace
  </p>
</div>
              </div>
            </div>

            <nav
  className="flex-1 overflow-y-auto px-3 py-5 space-y-1"
  style={{
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  }}
>
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => { setActiveSection(item.id); setMobileSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                      active
                        ? "bg-white text-accent-navy shadow-sm"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleDoctorLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/80 hover:bg-red-500/20 hover:text-white transition"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        <main className="w-full min-w-0 flex-1 px-3 pb-5 pt-20 sm:px-5 lg:p-8">
          {activeSection === "home" && (
  <div className="max-w-7xl mx-auto">

    {/* WELCOME BANNER */}
    <section className="relative min-h-[560px] sm:min-h-[520px] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#33151B] shadow-lg">

      {/* BACKGROUND IMAGE */}
      <img
        src="/dashboard.png"
        alt="Elite Gynaecology clinic workspace"
        className="absolute inset-0 w-full h-full object-contain object-center"
      />

      {/* DARK GRADIENT OVERLAY */}
      <div
  className="absolute inset-0"
  style={{
    background: `linear-gradient(
      90deg,
      rgba(122, 32, 51, 0.92) 0%,
      rgba(207, 54, 80, 0.72) 35%,
      rgba(255, 241, 244, 0.18) 65%,
      transparent 88%
    )`,
  }}
/>

      {/* CONTENT */}
      <div className="relative z-10 min-h-[560px] sm:min-h-[520px] flex items-end sm:items-center px-5 pb-8 pt-24 sm:px-8 sm:py-10 lg:px-14">

        <div className="w-full max-w-xl text-white">

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary-sage">
            Elite Gynaecology
          </p>

          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight break-words">
            Welcome,
            <span className="block mt-2">
              Prof. Dr. Ambreen Akhtar
            </span>
          </h1>

          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
            Doctor Workspace
          </p>

          <p className="mt-4 text-sm sm:text-base lg:text-lg leading-6 sm:leading-8 text-white/85">
            Manage your appointments, patients, medical records,
            prescriptions and clinic operations from one secure
            workspace.
          </p>

          {/* ACTION BUTTONS */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-3">

            <button
              type="button"
              onClick={() => setActiveSection("appointments")}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-accent-navy font-semibold shadow-sm hover:bg-secondary-sage transition"
            >
              View Appointments
            </button>

            <button
              type="button"
              onClick={() => setActiveSection("patients")}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/40 bg-white/10 backdrop-blur-sm text-white font-semibold hover:bg-white/20 transition"
            >
              Manage Patients
            </button>

          </div>

        </div>
      </div>
    </section>

  </div>
)}
{activeSection !== "home" && (
  <div key={activeSection} className="max-w-7xl mx-auto">

    {activeSection === "analytics" && (
      <section className="space-y-6">
        <div className="rounded-3xl p-7 text-white shadow-lg" style={{ background: "linear-gradient(135deg, #7A2033 0%, #CF3650 68%, #F5A900 150%)" }}>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70">Clinic Intelligence</p>
          <h1 className="mt-2 text-3xl font-bold">Analytics Overview</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/80">A visual snapshot of patient activity, appointments and verified clinic revenue.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            [Users, stats.totalPatients || 0, "Total Patients", "Patient registry"],
            [Calendar, stats.totalAppointments || 0, "Appointments", "All appointments"],
            [Clock, stats.pendingAppointments || 0, "Pending", "Awaiting completion"],
            [CheckCircle, stats.completedAppointments || 0, "Completed", "Finished visits"],
          ].map(([Icon, value, label, note]) => (
            <div key={label} className="card relative overflow-hidden">
              <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-secondary-pink/40" />
              <Icon className="relative w-7 h-7 text-[#CF3650] mb-5" />
              <p className="relative text-3xl font-bold text-accent-navy">{value}</p>
              <p className="relative mt-1 font-semibold text-accent-navy">{label}</p>
              <p className="relative text-xs text-text-light mt-1">{note}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-6"><div><p className="section-label">Appointments</p><h2 className="text-xl font-bold text-accent-navy mt-1">Status Distribution</h2></div><BarChart3 className="w-6 h-6 text-[#CF3650]" /></div>
            {[
              ["Completed", stats.completedAppointments || 0],
              ["Pending", stats.pendingAppointments || 0],
              ["Other / Scheduled", Math.max((stats.totalAppointments || 0) - (stats.completedAppointments || 0) - (stats.pendingAppointments || 0), 0)],
            ].map(([label, value]) => { const total = stats.totalAppointments || 0; const width = total ? Math.round((value / total) * 100) : 0; return (
              <div key={label} className="mb-5"><div className="flex justify-between text-sm mb-2"><span className="font-semibold text-accent-navy">{label}</span><span className="text-text-light">{value} · {width}%</span></div><div className="h-3 rounded-full bg-[#FFF1F4] overflow-hidden"><div className="h-full rounded-full bg-[#CF3650] transition-all" style={{ width: `${width}%` }} /></div></div>
            ); })}
            {(stats.totalAppointments || 0) === 0 && <p className="text-sm text-text-light text-center py-3">Charts will fill automatically when appointment data arrives.</p>}
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-6"><div><p className="section-label">Revenue</p><h2 className="text-xl font-bold text-accent-navy mt-1">Verified Revenue</h2></div><DollarSign className="w-6 h-6 text-[#F5A900]" /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-[#FFF1F4] p-5"><p className="text-xs uppercase tracking-wider text-text-light">PKR</p><p className="mt-2 text-2xl font-bold text-[#7A2033]">Rs {stats.totalRevenuePKR || 0}</p></div>
              <div className="rounded-2xl bg-[#FFF3E6] p-5"><p className="text-xs uppercase tracking-wider text-text-light">USD</p><p className="mt-2 text-2xl font-bold text-[#7A2033]">$ {stats.totalRevenueUSD || 0}</p></div>
            </div>
            <div className="mt-6 rounded-2xl border border-dashed border-[#CF3650]/30 bg-[#FFF7F8] p-5 text-center"><BarChart3 className="mx-auto w-9 h-9 text-[#CF3650]/50" /><p className="mt-2 font-semibold text-accent-navy">Revenue visualization is live</p><p className="text-xs text-text-light mt-1">Verified payments will update these totals automatically.</p></div>
          </div>
        </div>
      </section>
    )}

    {/* APPOINTMENTS + PATIENTS */}
        

        {/* =================================================
            APPOINTMENTS + PATIENTS
        ================================================== */}

        <div className="grid lg:grid-cols-3 gap-6">

          {/* APPOINTMENTS */}

{activeSection === "appointments" && (
  <div className="lg:col-span-3 card">
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
)}
          {/* PATIENTS */}

          {activeSection === "patients" && (
          <div className="lg:col-span-3 card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-semibold text-accent-navy flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Patients
                </h2>
                <p className="text-sm text-text-light mt-1">
                  Add patients, update their information and open complete clinical history.
                </p>
              </div>

              <button
                type="button"
                onClick={startCreatePatient}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Patient
              </button>
            </div>

            {showPatientForm && (
              <form
                onSubmit={savePatient}
                className="mb-6 rounded-2xl border border-[#F0D8DD] bg-[#FFF7F8] p-5"
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <p className="section-label">
                      {editingPatientId ? "Patient Update" : "New Patient"}
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-accent-navy">
                      {editingPatientId ? "Edit Patient Information" : "Add Patient"}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={resetPatientForm}
                    className="p-2 rounded-lg hover:bg-white"
                    aria-label="Close patient form"
                  >
                    <XCircle className="w-5 h-5 text-text-light" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-accent-navy mb-1">
                      Full Name *
                    </label>
                    <input
                      name="name"
                      className="input-field"
                      value={patientForm.name}
                      onChange={handlePatientFormChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-accent-navy mb-1">
                      Email <span className="font-normal text-text-light">(Optional)</span>
                    </label>
                    <input
                      name="email"
                      type="email"
                      className="input-field"
                      value={patientForm.email}
                      onChange={handlePatientFormChange}
                      placeholder="Optional — can be added later for portal access"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-accent-navy mb-1">
                      Phone *
                    </label>
                    <input
                      name="phone"
                      className="input-field"
                      value={patientForm.phone}
                      onChange={handlePatientFormChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-accent-navy mb-1">
                      Date of Birth
                    </label>
                    <input
                      name="dateOfBirth"
                      type="date"
                      className="input-field"
                      value={patientForm.dateOfBirth}
                      onChange={handlePatientFormChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-accent-navy mb-1">
                      Gender
                    </label>
                    <select
                      name="gender"
                      className="input-field"
                      value={patientForm.gender}
                      onChange={handlePatientFormChange}
                    >
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-accent-navy mb-1">
                      Country
                    </label>
                    <input
                      name="country"
                      className="input-field"
                      value={patientForm.country}
                      onChange={handlePatientFormChange}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-accent-navy mb-1">
                      Address
                    </label>
                    <textarea
                      name="address"
                      rows="3"
                      className="input-field"
                      value={patientForm.address}
                      onChange={handlePatientFormChange}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-5">
                  <button
                    type="submit"
                    disabled={patientSaving}
                    className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
                  >
                    <Save className="w-4 h-4" />
                    {patientSaving
                      ? "Saving..."
                      : editingPatientId
                        ? "Update Patient"
                        : "Add Patient"}
                  </button>
                  <button
                    type="button"
                    onClick={resetPatientForm}
                    className="px-5 py-2 rounded-lg border border-slate-200 bg-white text-accent-navy font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="flex gap-2 mb-4">
              <input
                className="input-field"
                placeholder="Search patient by name, email or phone..."
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
                  <div
                    key={p._id}
                    className={`p-3 rounded-xl transition ${
                      selectedPatient?._id === p._id
                        ? "bg-secondary-pink"
                        : "bg-primary-light"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => openPatient(p)}
                        className="text-left flex-1"
                      >
                        <p className="font-semibold text-accent-navy">{p.name}</p>
                        <p className="text-xs text-text-light mt-1">
                          {p.email} • {p.phone || "No phone"} • {p.country || "Pakistan"}
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => startEditPatient(p)}
                        className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-[#7A2033] text-xs font-semibold inline-flex items-center gap-1 self-start sm:self-auto"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                disabled={!patientPagination.hasPreviousPage}
                onClick={() => setPatientPage((page) => Math.max(page - 1, 1))}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-accent-navy transition hover:bg-primary-light disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="text-center">
                <p className="text-sm font-semibold text-accent-navy">
                  Page {patientPagination.currentPage} of {patientPagination.totalPages}
                </p>
                <p className="text-xs text-text-light mt-1">
                  {patientPagination.totalPatients}{" "}
                  {patientPagination.totalPatients === 1 ? "patient" : "patients"}
                </p>
              </div>

              <button
                type="button"
                disabled={!patientPagination.hasNextPage}
                onClick={() => setPatientPage((page) => page + 1)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-accent-navy transition hover:bg-primary-light disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
          )}
        </div>

        {/* =================================================
            PATIENT HISTORY
        ================================================== */}

        {activeSection === "patients" && selectedPatient && (
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

                      {(history.appointments || []).length === 0 ? (
                        <p className="text-sm text-text-light">
                          No appointments.
                        </p>
                      ) : (
                        (history.appointments || []).map(
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

                      {(history.prescriptions || []).length === 0 ? (
                        <p className="text-sm text-text-light">
                          No prescriptions.
                        </p>
                      ) : (
                        (history.prescriptions || []).map(
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

                              {(p.medicines || []).map(
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

                      {(history.reports || []).length ===
                        0 ? (
                        <p className="text-sm text-text-light">
                          No reports.
                        </p>
                      ) : (
                        (history.reports || []).map(
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
            MEDICAL RECORDS
        ================================================== */}
        {activeSection === "medical-records" && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3"><div><p className="section-label">Clinical Archive</p><h2 className="mt-2 text-3xl font-bold text-accent-navy flex items-center gap-2"><ClipboardList className="w-7 h-7 text-[#CF3650]" /> Medical Records</h2><p className="text-sm text-text-light mt-2">Secure patient reports and clinical documents in one place.</p></div></div>
            <div className="grid sm:grid-cols-3 gap-4">{[[Users, patients.length, "Patients on this page"],[FileText, history?.reports?.length || 0, "Selected patient records"],[CheckCircle, selectedPatient ? 1 : 0, "Patient selected"]].map(([Icon,v,l])=><div key={l} className="card"><Icon className="w-6 h-6 text-[#CF3650]"/><p className="text-3xl font-bold text-accent-navy mt-4">{v}</p><p className="text-sm text-text-light">{l}</p></div>)}</div>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="card"><h3 className="font-bold text-accent-navy mb-4">Choose Patient</h3><div className="space-y-2 max-h-[420px] overflow-auto">{patients.length ? patients.map((p)=><button key={p._id} type="button" onClick={()=>openPatient(p)} className={`w-full text-left p-3 rounded-xl transition ${selectedPatient?._id===p._id?"bg-secondary-pink":"bg-primary-light hover:bg-secondary-pink/50"}`}><p className="font-semibold text-accent-navy">{p.name}</p><p className="text-xs text-text-light">{p.email}</p></button>):<div className="py-10 text-center"><Users className="mx-auto w-10 h-10 text-[#CF3650]/30"/><p className="text-sm text-text-light mt-3">No patients to display yet.</p></div>}</div></div>
              <div className="lg:col-span-2 card">{!selectedPatient?<div className="min-h-[300px] flex flex-col items-center justify-center text-center"><ClipboardList className="w-14 h-14 text-[#CF3650]/25"/><h3 className="mt-4 font-bold text-accent-navy">Medical archive is ready</h3><p className="mt-2 text-sm text-text-light max-w-sm">Select a patient to visualize their uploaded medical records. Empty records will still show a clean clinical workspace.</p></div>:historyLoading?<p className="py-16 text-center text-text-light">Loading medical records...</p>:(history?.reports||[]).length===0?<div className="min-h-[300px] flex flex-col items-center justify-center text-center"><FileText className="w-14 h-14 text-[#F5A900]/50"/><h3 className="mt-4 font-bold text-accent-navy">No reports uploaded yet</h3><p className="mt-2 text-sm text-text-light">{selectedPatient.name} has no medical reports yet.</p></div>:<div><h3 className="font-bold text-accent-navy mb-4">{selectedPatient.name}'s Records</h3>{history.reports.map((r)=><button key={r._id} type="button" onClick={()=>openSecureFile(`/reports/${r._id}/file`)} className="block w-full text-left p-4 rounded-xl bg-[#FFF7F8] border border-[#FFF1F4] mb-3 hover:bg-[#FFF1F4]"><p className="font-semibold text-accent-navy">{r.title}</p><p className="text-xs text-text-light mt-1">{r.fileName || "Secure medical document"}</p></button>)}</div>}</div>
            </div>
          </section>
        )}

        {/* =================================================
            PRESCRIPTIONS
        ================================================== */}
        {activeSection === "prescriptions" && (
          <section className="space-y-6">
            <div><p className="section-label">Medication Workspace</p><h2 className="mt-2 text-3xl font-bold text-accent-navy flex items-center gap-2"><Pill className="w-7 h-7 text-[#CF3650]"/> Prescriptions</h2><p className="text-sm text-text-light mt-2">Review prescriptions visually by patient.</p></div>
            <div className="grid sm:grid-cols-3 gap-4">{[[Pill,history?.prescriptions?.length||0,"Selected prescriptions"],[Users,patients.length,"Patients on this page"],[Calendar,history?.appointments?.length||0,"Patient appointments"]].map(([Icon,v,l])=><div key={l} className="card"><Icon className="w-6 h-6 text-[#CF3650]"/><p className="mt-4 text-3xl font-bold text-accent-navy">{v}</p><p className="text-sm text-text-light">{l}</p></div>)}</div>
            <div className="grid lg:grid-cols-3 gap-6"><div className="card"><h3 className="font-bold text-accent-navy mb-4">Patients</h3><div className="space-y-2 max-h-[420px] overflow-auto">{patients.length?patients.map((p)=><button key={p._id} type="button" onClick={()=>openPatient(p)} className={`w-full text-left p-3 rounded-xl ${selectedPatient?._id===p._id?"bg-secondary-pink":"bg-primary-light hover:bg-secondary-pink/50"}`}><p className="font-semibold text-accent-navy">{p.name}</p><p className="text-xs text-text-light">{p.email}</p></button>):<p className="py-10 text-center text-sm text-text-light">No patients yet.</p>}</div></div><div className="lg:col-span-2 card">{!selectedPatient?<div className="min-h-[300px] flex flex-col items-center justify-center text-center"><Pill className="w-14 h-14 text-[#CF3650]/25"/><h3 className="mt-4 font-bold text-accent-navy">Prescription timeline</h3><p className="mt-2 text-sm text-text-light">Select a patient to view their medication history.</p></div>:historyLoading?<p className="py-16 text-center">Loading prescriptions...</p>:(history?.prescriptions||[]).length===0?<div className="min-h-[300px] flex flex-col items-center justify-center text-center"><Pill className="w-14 h-14 text-[#F5A900]/50"/><h3 className="mt-4 font-bold text-accent-navy">No prescriptions yet</h3><p className="text-sm text-text-light mt-2">New prescriptions can be created from the Patients workspace.</p><button type="button" onClick={()=>setActiveSection("patients")} className="btn-primary mt-5">Open Patient Workspace</button></div>:<div className="space-y-3">{history.prescriptions.map((p)=><div key={p._id} className="p-5 rounded-2xl bg-[#FFF7F8] border border-[#FFF1F4]"><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-accent-navy">{p.diagnosis}</p><p className="text-sm text-text-light mt-1">{p.recommendations||"No recommendations added."}</p></div><span className="px-3 py-1 rounded-full bg-[#FFF3E6] text-[#7A2033] text-xs font-bold">{p.medicines?.length||0} medicines</span></div></div>)}</div>}</div></div>
          </section>
        )}

        {/* =================================================
            PAYMENTS
        ================================================== */}
        {activeSection === "payments" && (
          <section className="space-y-6">
            <div><p className="section-label">Financial Overview</p><h2 className="mt-2 text-3xl font-bold text-accent-navy flex items-center gap-2"><DollarSign className="w-7 h-7 text-[#F5A900]"/> Payments</h2><p className="text-sm text-text-light mt-2">Payment verification and status distribution from appointment records.</p></div>
            {(()=>{const successful=appointments.filter(a=>a.payment?.status==="Successful").length;const pending=appointments.filter(a=>!a.payment?.status||a.payment?.status==="Pending").length;const failed=appointments.filter(a=>a.payment?.status==="Failed").length;const total=appointments.length||1;return <><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{[[CheckCircle,successful,"Successful"],[Clock,pending,"Pending"],[XCircle,failed,"Failed"],[DollarSign,appointments.length,"Payment records"]].map(([Icon,v,l])=><div key={l} className="card"><Icon className="w-6 h-6 text-[#CF3650]"/><p className="mt-4 text-3xl font-bold text-accent-navy">{v}</p><p className="text-sm text-text-light">{l}</p></div>)}</div><div className="grid lg:grid-cols-2 gap-6"><div className="card"><h3 className="font-bold text-accent-navy mb-6">Payment Status</h3>{[["Successful",successful],["Pending",pending],["Failed",failed]].map(([l,v])=><div key={l} className="mb-5"><div className="flex justify-between text-sm mb-2"><span className="font-semibold text-accent-navy">{l}</span><span className="text-text-light">{appointments.length?Math.round(v/total*100):0}%</span></div><div className="h-3 rounded-full bg-[#FFF1F4] overflow-hidden"><div className="h-full rounded-full bg-[#CF3650]" style={{width:`${appointments.length?Math.round(v/total*100):0}%`}}/></div></div>)}{!appointments.length&&<p className="text-center text-sm text-text-light py-5">Payment chart will populate with appointment data.</p>}</div><div className="card"><h3 className="font-bold text-accent-navy mb-4">Recent Payment Activity</h3>{appointments.length===0?<div className="min-h-[240px] flex flex-col items-center justify-center text-center"><DollarSign className="w-14 h-14 text-[#F5A900]/40"/><p className="mt-3 font-semibold text-accent-navy">No payments yet</p><p className="text-sm text-text-light mt-1">New payment activity will appear here automatically.</p></div>:<div className="space-y-3 max-h-[320px] overflow-auto">{appointments.slice(0,6).map(apt=><div key={apt._id} className="p-3 rounded-xl bg-[#FFF7F8] flex items-center justify-between gap-3"><div><p className="font-semibold text-accent-navy">{apt.patient?.name||"Patient"}</p><p className="text-xs text-text-light">{apt.consultationFee} {apt.currency} · {apt.paymentMethod}</p></div><span className="text-xs font-bold text-[#7A2033]">{apt.payment?.status||"Pending"}</span></div>)}</div>}</div></div></>})()}
          </section>
        )}

        {/* =================================================
            REPORTS
        ================================================== */}
        {activeSection === "reports" && (
          <section className="space-y-6">
            <div><p className="section-label">Clinical Documents</p><h2 className="mt-2 text-3xl font-bold text-accent-navy flex items-center gap-2"><FileText className="w-7 h-7 text-[#CF3650]"/> Reports</h2><p className="text-sm text-text-light mt-2">A visual reporting hub for patient documents.</p></div>
            <div className="grid sm:grid-cols-3 gap-4">{[[FileText,history?.reports?.length||0,"Selected patient reports"],[Users,patients.length,"Patients on this page"],[Upload,selectedPatient?1:0,"Ready to manage"]].map(([Icon,v,l])=><div key={l} className="card"><Icon className="w-6 h-6 text-[#CF3650]"/><p className="mt-4 text-3xl font-bold text-accent-navy">{v}</p><p className="text-sm text-text-light">{l}</p></div>)}</div>
            <div className="card min-h-[340px] flex flex-col items-center justify-center text-center"><div className="w-24 h-24 rounded-full bg-[#FFF1F4] flex items-center justify-center"><FileText className="w-11 h-11 text-[#CF3650]"/></div><h3 className="mt-5 text-xl font-bold text-accent-navy">Reports workspace is ready</h3><p className="mt-2 text-sm text-text-light max-w-lg">Patient report files remain available through the secure Medical Records workspace. As records are uploaded, the counters above update for the selected patient.</p><button type="button" onClick={()=>setActiveSection("medical-records")} className="btn-primary mt-6">Open Medical Records</button></div>
          </section>
        )}

        {/* =================================================
            NOTIFICATIONS
        ================================================== */}
        {activeSection === "notifications" && (
          <section className="space-y-6">
            {(() => {
              const unread = notifications.filter((item) => !item.isRead).length;
              const read = notifications.length - unread;
              return (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                      <p className="section-label">Clinic Alerts</p>
                      <h2 className="mt-2 text-3xl font-bold text-accent-navy flex items-center gap-2">
                        <Bell className="w-7 h-7 text-[#CF3650]" /> Notifications
                      </h2>
                      <p className="text-sm text-text-light mt-2">Live appointment, payment and system alerts for the doctor account.</p>
                    </div>
                    {unread > 0 && (
                      <button type="button" onClick={markAllNotificationsRead} className="appointment-btn">
                        <CheckCircle className="w-4 h-4" /> Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    {[[Bell, notifications.length, "Total notifications"], [Clock, unread, "Unread"], [CheckCircle, read, "Read"]].map(([Icon, value, label]) => (
                      <div key={label} className="card">
                        <Icon className="w-6 h-6 text-[#CF3650]" />
                        <p className="mt-4 text-3xl font-bold text-accent-navy">{value}</p>
                        <p className="text-sm text-text-light">{label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="card">
                    <div className="flex items-center justify-between gap-3 mb-5">
                      <h3 className="font-bold text-accent-navy">Recent Notifications</h3>
                      <button type="button" onClick={fetchNotifications} className="text-sm font-semibold text-[#CF3650]">Refresh</button>
                    </div>

                    {notificationsLoading ? (
                      <div className="py-14 text-center text-text-light">Loading notifications...</div>
                    ) : notifications.length === 0 ? (
                      <div className="min-h-[280px] flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 rounded-full bg-[#FFF1F4] flex items-center justify-center">
                          <Bell className="w-11 h-11 text-[#CF3650]" />
                        </div>
                        <h3 className="mt-5 text-xl font-bold text-accent-navy">All quiet for now</h3>
                        <p className="mt-2 text-sm text-text-light max-w-md">No notification records are available for this doctor account yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {notifications.map((item) => (
                          <div key={item._id} className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${item.isRead ? "border-slate-100 bg-white" : "border-[#F0C6CE] bg-[#FFF7F8]"}`}>
                            <div className="flex gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.isRead ? "bg-slate-100" : "bg-[#FFF1F4]"}`}>
                                <Bell className="w-5 h-5 text-[#CF3650]" />
                              </div>
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-bold text-accent-navy">{item.title || "Notification"}</p>
                                  {!item.isRead && <span className="text-[10px] uppercase tracking-wide font-bold rounded-full bg-[#CF3650] text-white px-2 py-1">New</span>}
                                </div>
                                <p className="text-sm text-text-light mt-1">{item.message}</p>
                                <p className="text-xs text-text-light mt-2 capitalize">{item.type || "system"} · {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}</p>
                              </div>
                            </div>
                            {!item.isRead && (
                              <button type="button" onClick={() => markNotificationRead(item._id)} className="appointment-btn shrink-0">Mark as read</button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </section>
        )}

        {/* =================================================
            PROFILE
        ================================================== */}
        {activeSection === "profile" && (
          <section className="card max-w-3xl">
            <h2 className="text-2xl font-bold text-accent-navy flex items-center gap-2"><UserCircle className="w-6 h-6" /> Doctor Profile</h2>
            <div className="mt-5 space-y-3"><div className="p-4 rounded-xl bg-primary-light"><p className="text-xs text-text-light">Name</p>
            <p className="font-semibold text-accent-navy">{user?.name || websiteSettings?.doctor?.name || "Doctor"}</p></div><div className="p-4 rounded-xl bg-primary-light"><p className="text-xs text-text-light">Email</p><p className="font-semibold text-accent-navy">{user?.email || "—"}</p></div><div className="p-4 rounded-xl bg-primary-light"><p className="text-xs text-text-light">Specialty</p>
            <p className="font-semibold text-accent-navy">
  {(websiteSettings?.doctor?.specialty || "Gynaecology")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")}
</p></div></div>
          </section>
        )}


{activeSection === "website" && (
  <section className="mt-8 card">

    {/* =====================================================
        HEADER
    ===================================================== */}

    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
      <div>
        <p className="section-label">Website CMS</p>

        <h2 className="mt-2 text-2xl font-bold text-accent-navy flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Website Management
        </h2>

        <p className="text-sm text-text-light mt-1">
          Manage website content, services, design and SEO from one place.
        </p>
      </div>

      <button
        type="button"
        onClick={saveWebsiteSettings}
        disabled={websiteSaving || websiteLoading || !websiteSettings}
        className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
      >
        <Save className="w-4 h-4" />
        {websiteSaving ? "Saving..." : "Save Website Changes"}
      </button>
    </div>

    {websiteLoading ? (
      <div className="py-10 text-center text-text-light">
        Loading website settings...
      </div>
    ) : !websiteSettings ? (
      <div className="py-10 text-center text-text-light">
        Website settings could not be loaded.
      </div>
    ) : (
      <>
        {/* =====================================================
            MAIN CMS TABS
        ===================================================== */}

        <div className="mb-7 overflow-x-auto">
          <div className="inline-flex min-w-max rounded-2xl border border-[#F0D8DD] bg-[#FFF7F8] p-1">
            {[
              ["content", "Content"],
              ["services", "Services"],
              ["design", "Design"],
              ["seo", "SEO"],
            ].map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                onClick={() => setCmsTab(tab)}
                className={`flex-1 sm:flex-none px-5 py-3 rounded-xl text-sm font-bold transition ${
                  cmsTab === tab
                    ? "bg-white text-[#7A2033] shadow-sm"
                    : "text-slate-500 hover:text-[#7A2033]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* =====================================================
            CONTENT
        ===================================================== */}

        {cmsTab === "content" && (
          <div>
            <div className="mb-6">
              <p className="section-label">Website Content</p>

              <h3 className="mt-2 text-xl font-bold text-accent-navy">
                Edit Public Website Content
              </h3>

              <p className="text-sm text-text-light mt-1">
                Select a website section and update its content.
              </p>
            </div>

            {/* CONTENT SUB TABS */}

            <div className="flex flex-wrap gap-2 mb-6">
              {[
                ["hero", "Hero"],
                ["about", "About"],
                ["doctor", "Doctor"],
                ["contact", "Contact"],
              ].map(([tab, label]) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setCmsContentTab(tab)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition ${
                    cmsContentTab === tab
                      ? "bg-[#7A2033] border-[#7A2033] text-white"
                      : "bg-white border-slate-200 text-slate-600 hover:border-[#CF3650]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* ================= HERO ================= */}

            {cmsContentTab === "hero" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <h4 className="text-lg font-bold text-accent-navy">
                      Hero Slides
                    </h4>

                    <p className="text-sm text-text-light mt-1">
                      Manage the main banners shown on the website.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addHeroSlide}
                    className="appointment-btn"
                  >
                    <Plus className="w-4 h-4" />
                    Add Slide
                  </button>
                </div>

                <div className="space-y-4">
                  {(websiteSettings.heroSlides || []).map((slide, index) => (
                    <div
                      key={slide._id || index}
                      className="rounded-2xl border border-[#F0D8DD] bg-[#FFF7F8] p-5"
                    >
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#CF3650]">
                            Slide {index + 1}
                          </p>

                          <h5 className="font-bold text-accent-navy mt-1">
                            {slide.title || "Untitled Hero Slide"}
                          </h5>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeHeroSlide(index)}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                          title="Delete slide"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-accent-navy mb-1">
                            Eyebrow
                          </label>

                          <input
                            className="input-field"
                            value={slide.eyebrow || ""}
                            onChange={(e) =>
                              updateHeroSlide(
                                index,
                                "eyebrow",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-accent-navy mb-1">
                            Title
                          </label>

                          <input
                            className="input-field"
                            value={slide.title || ""}
                            onChange={(e) =>
                              updateHeroSlide(
                                index,
                                "title",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-accent-navy mb-1">
                            Description
                          </label>

                          <textarea
                            rows="3"
                            className="input-field"
                            value={slide.text || ""}
                            onChange={(e) =>
                              updateHeroSlide(
                                index,
                                "text",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-accent-navy mb-1">
                            Image Path / HTTPS URL
                          </label>

                          <input
                            className="input-field"
                            value={slide.image || ""}
                            onChange={(e) =>
                              updateHeroSlide(
                                index,
                                "image",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-accent-navy mb-1">
                            Image Alt Text
                          </label>

                          <input
                            className="input-field"
                            value={slide.imageAlt || ""}
                            onChange={(e) =>
                              updateHeroSlide(
                                index,
                                "imageAlt",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-accent-navy">
                        <input
                          type="checkbox"
                          checked={slide.isActive !== false}
                          onChange={(e) =>
                            updateHeroSlide(
                              index,
                              "isActive",
                              e.target.checked
                            )
                          }
                        />
                        Active slide
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= ABOUT ================= */}

            {cmsContentTab === "about" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h4 className="text-lg font-bold text-accent-navy">
                  About Section
                </h4>

                <p className="text-sm text-text-light mt-1 mb-5">
                  Edit the content displayed in the About section.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    ["eyebrow", "Eyebrow"],
                    ["title", "Title"],
                    ["highlight", "Highlighted Title"],
                    ["image", "Image Path / HTTPS URL"],
                    ["imageAlt", "Image Alt Text"],
                  ].map(([field, label]) => (
                    <div key={field}>
                      <label className="block text-sm font-semibold text-accent-navy mb-1">
                        {label}
                      </label>

                      <input
                        className="input-field"
                        value={websiteSettings.about?.[field] || ""}
                        onChange={(e) =>
                          updateWebsiteSection(
                            "about",
                            field,
                            e.target.value
                          )
                        }
                      />
                    </div>
                  ))}

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-accent-navy mb-1">
                      First Paragraph
                    </label>

                    <textarea
                      rows="4"
                      className="input-field"
                      value={websiteSettings.about?.description1 || ""}
                      onChange={(e) =>
                        updateWebsiteSection(
                          "about",
                          "description1",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-accent-navy mb-1">
                      Second Paragraph
                    </label>

                    <textarea
                      rows="4"
                      className="input-field"
                      value={websiteSettings.about?.description2 || ""}
                      onChange={(e) =>
                        updateWebsiteSection(
                          "about",
                          "description2",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ================= DOCTOR ================= */}

            {cmsContentTab === "doctor" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h4 className="text-lg font-bold text-accent-navy">
                  Doctor Information
                </h4>

                <p className="text-sm text-text-light mt-1 mb-5">
                  Manage the doctor's public profile information.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-accent-navy mb-1">
                      Doctor Name
                    </label>

                    <input
                      className="input-field"
                      value={websiteSettings.doctor?.name || ""}
                      onChange={(e) =>
                        updateWebsiteSection(
                          "doctor",
                          "name",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-accent-navy mb-1">
                      Specialty
                    </label>

                    <input
                      className="input-field"
                      value={websiteSettings.doctor?.specialty || ""}
                      onChange={(e) =>
                        updateWebsiteSection(
                          "doctor",
                          "specialty",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-accent-navy mb-1">
                      Qualifications
                    </label>

                    <textarea
                      rows="4"
                      className="input-field"
                      value={websiteSettings.doctor?.qualifications || ""}
                      onChange={(e) =>
                        updateWebsiteSection(
                          "doctor",
                          "qualifications",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ================= CONTACT ================= */}

            {cmsContentTab === "contact" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h4 className="text-lg font-bold text-accent-navy">
                  Contact Information
                </h4>

                <p className="text-sm text-text-light mt-1 mb-5">
                  Update the clinic contact information shown publicly.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    ["phone", "Phone"],
                    ["email", "Email"],
                    ["address", "Address"],
                    ["clinicHours", "Clinic Hours"],
                  ].map(([field, label]) => (
                    <div key={field}>
                      <label className="block text-sm font-semibold text-accent-navy mb-1">
                        {label}
                      </label>

                      <input
                        className="input-field"
                        value={websiteSettings.contact?.[field] || ""}
                        onChange={(e) =>
                          updateWebsiteSection(
                            "contact",
                            field,
                            e.target.value
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =====================================================
            SERVICES
        ===================================================== */}

        {cmsTab === "services" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <p className="section-label">Services Management</p>

                <h3 className="mt-2 text-xl font-bold text-accent-navy">
                  Website Services
                </h3>

                <p className="text-sm text-text-light mt-1">
                  Select a service to edit its content and SEO.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  addService();
                  setSelectedServiceIndex(
                    (websiteSettings.services || []).length
                  );
                  setServiceEditorTab("content");
                }}
                className="appointment-btn"
              >
                <Plus className="w-4 h-4" />
                Add Service
              </button>
            </div>

            {(websiteSettings.services || []).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
                <Stethoscope className="w-10 h-10 mx-auto text-[#CF3650]" />

                <p className="mt-3 font-bold text-accent-navy">
                  No services added yet.
                </p>

                <button
                  type="button"
                  onClick={addService}
                  className="mt-4 appointment-btn"
                >
                  <Plus className="w-4 h-4" />
                  Add First Service
                </button>
              </div>
            ) : (
              <div className="grid xl:grid-cols-[300px_1fr] gap-6">

                {/* SERVICE LIST */}

                <div className="space-y-3">
                  {(websiteSettings.services || []).map((service, index) => {
                    const analysis = getServiceSeoAnalysis(service);

                    return (
                      <button
                        key={service._id || index}
                        type="button"
                        onClick={() => {
                          setSelectedServiceIndex(index);
                          setServiceEditorTab("content");
                          setServiceSeoTab("general");
                        }}
                        className={`w-full text-left rounded-2xl border p-4 transition ${
                          selectedServiceIndex === index
                            ? "border-[#CF3650] bg-[#FFF7F8] shadow-sm"
                            : "border-slate-200 bg-white hover:border-[#F0A8B4]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-bold text-accent-navy truncate">
                              {service.title || "New Service"}
                            </p>

                            <p className="text-xs text-text-light mt-1 truncate">
                              /services/{service.slug || "service-slug"}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                              analysis.score >= 80
                                ? "bg-green-100 text-green-700"
                                : analysis.score >= 50
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {analysis.score}/100
                          </span>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              service.isActive !== false
                                ? "bg-green-500"
                                : "bg-slate-300"
                            }`}
                          />

                          <span className="text-xs font-medium text-slate-500">
                            {service.isActive !== false
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* SELECTED SERVICE */}

                {(() => {
                  const services = websiteSettings.services || [];

                  const safeIndex = Math.min(
                    selectedServiceIndex,
                    Math.max(services.length - 1, 0)
                  );

                  const service = services[safeIndex];

                  if (!service) return null;

                  const analysis = getServiceSeoAnalysis(service);

                  const previewTitle =
                    service.seoTitle ||
                    service.title ||
                    "Service title";

                  const previewDescription =
                    service.metaDescription ||
                    service.description ||
                    "Add a meta description to preview how this service may appear in search.";

                  const previewUrl =
                    service.canonicalUrl ||
                    `https://elite-gynaecology.vercel.app/services/${
                      service.slug || ""
                    }`;

                  return (
                    <div className="min-w-0">

                      {/* SERVICE HEADER */}

                      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.15em] font-bold text-[#CF3650]">
                              Selected Service
                            </p>

                            <h4 className="mt-1 text-xl font-bold text-accent-navy">
                              {service.title || "New Service"}
                            </h4>

                            <p className="text-sm text-text-light mt-1">
                              /services/{service.slug || "service-slug"}
                            </p>
                          </div>

                          <label className="flex items-center gap-2 text-sm font-semibold text-accent-navy">
                            <input
                              type="checkbox"
                              checked={service.isActive !== false}
                              onChange={(e) =>
                                updateService(
                                  safeIndex,
                                  "isActive",
                                  e.target.checked
                                )
                              }
                            />

                            Active
                          </label>
                        </div>

                        {/* CONTENT / SEO */}

                        <div className="flex border-b border-slate-100 bg-[#FFF7F8]">
                          {[
                            ["content", "Content"],
                            ["seo", "SEO"],
                          ].map(([tab, label]) => (
                            <button
                              key={tab}
                              type="button"
                              onClick={() => setServiceEditorTab(tab)}
                              className={`px-6 py-3 text-sm font-bold border-b-2 transition ${
                                serviceEditorTab === tab
                                  ? "border-[#CF3650] text-[#7A2033] bg-white"
                                  : "border-transparent text-slate-500"
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>

                        {/* SERVICE CONTENT */}

                        {serviceEditorTab === "content" && (
                          <div className="p-5">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-accent-navy mb-1">
                                  Service Title
                                </label>

                                <input
                                  className="input-field"
                                  value={service.title || ""}
                                  onChange={(e) =>
                                    updateService(
                                      safeIndex,
                                      "title",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-semibold text-accent-navy mb-1">
                                  URL Slug
                                </label>

                                <input
                                  className="input-field"
                                  value={service.slug || ""}
                                  onChange={(e) =>
                                    updateService(
                                      safeIndex,
                                      "slug",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>

                              <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-accent-navy mb-1">
                                  Image Path / HTTPS URL
                                </label>

                                <input
                                  className="input-field"
                                  value={service.image || ""}
                                  onChange={(e) =>
                                    updateService(
                                      safeIndex,
                                      "image",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>

                              <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-accent-navy mb-1">
                                  Image Alt Text
                                </label>

                                <input
                                  className="input-field"
                                  value={service.imageAlt || ""}
                                  onChange={(e) =>
                                    updateService(
                                      safeIndex,
                                      "imageAlt",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Describe the service image"
                                />
                              </div>

                              <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-accent-navy mb-1">
                                  Service Description
                                </label>

                                <textarea
                                  rows="5"
                                  className="input-field"
                                  value={service.description || ""}
                                  onChange={(e) =>
                                    updateService(
                                      safeIndex,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            </div>

                            <div className="mt-6 pt-5 border-t border-slate-100 flex justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  removeService(safeIndex);

                                  setSelectedServiceIndex((current) =>
                                    Math.max(
                                      0,
                                      Math.min(
                                        current,
                                        services.length - 2
                                      )
                                    )
                                  );
                                }}
                                className="px-4 py-2.5 rounded-xl bg-red-50 text-red-700 font-semibold inline-flex items-center gap-2 hover:bg-red-100"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete Service
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* =====================================================
                          BLOG-STYLE SERVICE SEO
                      ===================================================== */}

                      {serviceEditorTab === "seo" && (
                        <div className="mt-5 rounded-2xl border border-[#f2c7cf] bg-white overflow-hidden shadow-sm">

                          {/* SAME HEADER STYLE AS BLOG */}

                          <div className="p-5 bg-gradient-to-r from-[#7A2033] to-[#CF3650] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-white/70">
                                SEO Assistant
                              </p>

                              <h3 className="text-xl font-bold mt-1">
                                Optimize this service for search
                              </h3>

                              <p className="text-sm text-white/75 mt-1">
                                Rank-Math-style guidance for search,
                                social sharing and schema.
                              </p>
                            </div>

                            <div className="w-20 h-20 rounded-full bg-white/15 border-4 border-white/30 flex flex-col items-center justify-center shrink-0">
                              <span className="text-2xl font-bold">
                                {analysis.score}
                              </span>

                              <span className="text-[10px] uppercase tracking-wide">
                                SEO Score
                              </span>
                            </div>
                          </div>

                          {/* SAME BLOG SEO TABS */}

                          <div className="flex flex-wrap border-b border-slate-100 bg-[#FFF7F8]">
                            {[
                              "general",
                              "social",
                              "schema",
                              "analysis",
                            ].map((tab) => (
                              <button
                                key={tab}
                                type="button"
                                onClick={() =>
                                  setServiceSeoTab(tab)
                                }
                                className={`px-5 py-3 text-sm font-semibold capitalize border-b-2 transition ${
                                  serviceSeoTab === tab
                                    ? "border-[#CF3650] text-[#7A2033] bg-white"
                                    : "border-transparent text-slate-500"
                                }`}
                              >
                                {tab}
                              </button>
                            ))}
                          </div>

                          <div className="p-5">

                            {/* ============== GENERAL ============== */}

                            {serviceSeoTab === "general" && (
                              <div className="space-y-5">
                                <div>
                                  <label className="block text-sm font-semibold text-accent-navy mb-1">
                                    Focus Keyword
                                  </label>

                                  <input
                                    className="input-field"
                                    placeholder="e.g. PCOS treatment Lahore"
                                    value={service.primaryKeyword || ""}
                                    onChange={(e) =>
                                      updateService(
                                        safeIndex,
                                        "primaryKeyword",
                                        e.target.value
                                      )
                                    }
                                  />

                                  <p className="text-xs text-text-light mt-1">
                                    Main search phrase you want this
                                    service to target.
                                  </p>
                                </div>

                                <div>
                                  <div className="flex justify-between gap-3 mb-1">
                                    <label className="text-sm font-semibold text-accent-navy">
                                      SEO Title
                                    </label>

                                    <span
                                      className={`text-xs font-semibold ${
                                        analysis.title.length >= 30 &&
                                        analysis.title.length <= 60
                                          ? "text-green-700"
                                          : "text-amber-700"
                                      }`}
                                    >
                                      {analysis.title.length}/60
                                    </span>
                                  </div>

                                  <input
                                    className="input-field"
                                    placeholder={
                                      service.title || "SEO title"
                                    }
                                    value={service.seoTitle || ""}
                                    onChange={(e) =>
                                      updateService(
                                        safeIndex,
                                        "seoTitle",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>

                                <div>
                                  <div className="flex justify-between gap-3 mb-1">
                                    <label className="text-sm font-semibold text-accent-navy">
                                      Meta Description
                                    </label>

                                    <span
                                      className={`text-xs font-semibold ${
                                        analysis.description.length >=
                                          120 &&
                                        analysis.description.length <=
                                          160
                                          ? "text-green-700"
                                          : "text-amber-700"
                                      }`}
                                    >
                                      {analysis.description.length}/160
                                    </span>
                                  </div>

                                  <textarea
                                    rows="4"
                                    className="input-field"
                                    placeholder="Write a compelling search description..."
                                    value={
                                      service.metaDescription || ""
                                    }
                                    onChange={(e) =>
                                      updateService(
                                        safeIndex,
                                        "metaDescription",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-semibold text-accent-navy mb-1">
                                      Secondary Keywords
                                    </label>

                                    <input
                                      className="input-field"
                                      placeholder="keyword one, keyword two"
                                      value={(
                                        service.secondaryKeywords || []
                                      ).join(", ")}
                                      onChange={(e) =>
                                        updateService(
                                          safeIndex,
                                          "secondaryKeywords",
                                          commaStringToArray(
                                            e.target.value
                                          )
                                        )
                                      }
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-semibold text-accent-navy mb-1">
                                      Meta Keywords
                                    </label>

                                    <input
                                      className="input-field"
                                      placeholder="keyword one, keyword two"
                                      value={(
                                        service.metaKeywords || []
                                      ).join(", ")}
                                      onChange={(e) =>
                                        updateService(
                                          safeIndex,
                                          "metaKeywords",
                                          commaStringToArray(
                                            e.target.value
                                          )
                                        )
                                      }
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-semibold text-accent-navy mb-1">
                                    Canonical URL
                                  </label>

                                  <input
                                    className="input-field"
                                    placeholder={`https://elite-gynaecology.vercel.app/services/${
                                      service.slug ||
                                      "service-slug"
                                    }`}
                                    value={service.canonicalUrl || ""}
                                    onChange={(e) =>
                                      updateService(
                                        safeIndex,
                                        "canonicalUrl",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>

                                <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-[#FFF7F8] p-4 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="mt-1"
                                    checked={
                                      service.indexPage !== false
                                    }
                                    onChange={(e) =>
                                      updateService(
                                        safeIndex,
                                        "indexPage",
                                        e.target.checked
                                      )
                                    }
                                  />

                                  <span>
                                    <span className="block text-sm font-bold text-accent-navy">
                                      Allow search engines to index
                                      this service
                                    </span>

                                    <span className="block text-xs text-text-light mt-1">
                                      Disable only when this page
                                      should intentionally be hidden
                                      from search engines.
                                    </span>
                                  </span>
                                </label>

                                {/* GOOGLE PREVIEW */}

                                <div className="rounded-2xl border border-slate-200 p-5">
                                  <p className="text-xs uppercase tracking-[0.14em] font-bold text-[#CF3650]">
                                    Search Preview
                                  </p>

                                  <h4 className="font-bold text-accent-navy mt-1">
                                    Google-style Preview
                                  </h4>

                                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                                    <p className="text-xs text-green-700 break-all">
                                      {previewUrl}
                                    </p>

                                    <p className="mt-1 text-xl text-[#1a0dab] font-medium leading-snug">
                                      {previewTitle}
                                    </p>

                                    <p className="mt-2 text-sm leading-6 text-[#4B5563]">
                                      {previewDescription}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* ============== SOCIAL ============== */}

                            {serviceSeoTab === "social" && (
                              <div className="grid lg:grid-cols-2 gap-5">
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-semibold text-accent-navy mb-1">
                                      Social Title
                                    </label>

                                    <input
                                      className="input-field"
                                      value={service.ogTitle || ""}
                                      onChange={(e) =>
                                        updateService(
                                          safeIndex,
                                          "ogTitle",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Defaults to SEO title when empty"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-semibold text-accent-navy mb-1">
                                      Social Description
                                    </label>

                                    <textarea
                                      rows="4"
                                      className="input-field"
                                      value={
                                        service.ogDescription || ""
                                      }
                                      onChange={(e) =>
                                        updateService(
                                          safeIndex,
                                          "ogDescription",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Defaults to meta description when empty"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-semibold text-accent-navy mb-1">
                                      Social Image URL
                                    </label>

                                    <input
                                      className="input-field"
                                      value={service.ogImage || ""}
                                      onChange={(e) =>
                                        updateService(
                                          safeIndex,
                                          "ogImage",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Image path or HTTPS URL"
                                    />
                                  </div>
                                </div>

                                {/* SOCIAL PREVIEW */}

                                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white self-start">
                                  {service.ogImage || service.image ? (
                                    <img
                                      src={
                                        service.ogImage ||
                                        service.image
                                      }
                                      alt={
                                        service.ogTitle ||
                                        service.title ||
                                        "Social preview"
                                      }
                                      className="w-full h-44 object-cover"
                                    />
                                  ) : (
                                    <div className="h-44 bg-[#FFF1F4] flex items-center justify-center text-sm text-[#7A2033]">
                                      Social image preview
                                    </div>
                                  )}

                                  <div className="p-4">
                                    <p className="text-xs uppercase text-slate-500">
                                      elite-gynaecology.vercel.app
                                    </p>

                                    <p className="mt-1 font-bold text-accent-navy">
                                      {service.ogTitle ||
                                        previewTitle}
                                    </p>

                                    <p className="mt-2 text-sm text-text-light">
                                      {service.ogDescription ||
                                        previewDescription}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* ============== SCHEMA ============== */}

                            {serviceSeoTab === "schema" && (
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-semibold text-accent-navy mb-1">
                                    Schema Type
                                  </label>

                                  <div className="input-field bg-slate-50 text-slate-600">
                                    MedicalWebPage / MedicalService
                                  </div>
                                </div>

                                <div className="rounded-xl bg-[#FFF3E6] border border-[#F5A900]/30 p-4">
                                  <p className="font-semibold text-[#7A2033]">
                                    Structured Data
                                  </p>

                                  <p className="text-sm text-text-light mt-1 leading-6">
                                    Service structured data is
                                    generated from the service title,
                                    description, URL, image and website
                                    information.
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* ============== ANALYSIS ============== */}

                            {serviceSeoTab === "analysis" && (
                              <div>
                                <div className="flex items-end justify-between gap-4 mb-4">
                                  <div>
                                    <h4 className="font-bold text-accent-navy">
                                      SEO Analysis
                                    </h4>

                                    <p className="text-sm text-text-light mt-1">
                                      {
                                        analysis.checks.filter(
                                          (check) => check.passed
                                        ).length
                                      }{" "}
                                      of {analysis.checks.length} checks
                                      passed
                                    </p>
                                  </div>

                                  <span className="text-2xl font-bold text-[#CF3650]">
                                    {analysis.score}%
                                  </span>
                                </div>

                                <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-5">
                                  <div
                                    className="h-full bg-[#CF3650] transition-all"
                                    style={{
                                      width: `${analysis.score}%`,
                                    }}
                                  />
                                </div>

                                <div className="space-y-2">
                                  {analysis.checks.map((check) => (
                                    <div
                                      key={check.label}
                                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
                                        check.passed
                                          ? "bg-green-50 text-green-800"
                                          : "bg-[#FFF1F4] text-[#7A2033]"
                                      }`}
                                    >
                                      <span
                                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                                          check.passed
                                            ? "bg-green-100"
                                            : "bg-white"
                                        }`}
                                      >
                                        {check.passed ? "✓" : "!"}
                                      </span>

                                      <span className="font-medium">
                                        {check.label}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* =====================================================
            DESIGN
        ===================================================== */}

        {cmsTab === "design" && (
          <div className="space-y-6">
            <div>
              <p className="section-label">Website Design</p>

              <h3 className="mt-2 text-xl font-bold text-accent-navy">
                Theme & Typography
              </h3>

              <p className="text-sm text-text-light mt-1">
                Control global colors, fonts and section-specific text styles.
              </p>
            </div>

            {/* GLOBAL THEME */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h4 className="font-bold text-accent-navy flex items-center gap-2 mb-5">
                <Palette className="w-5 h-5" />
                Global Theme
              </h4>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  ["primaryColor", "Primary"],
                  ["secondaryColor", "Secondary"],
                  ["accentColor", "Accent"],
                  ["textColor", "Text"],
                ].map(([field, label]) => (
                  <div key={field}>
                    <label className="block text-sm font-semibold text-accent-navy mb-1">
                      {label} Color
                    </label>

                    <div className="flex gap-2">
                      <input
                        type="color"
                        className="h-11 w-14 rounded border"
                        value={
                          websiteSettings.theme?.[field] ||
                          "#000000"
                        }
                        onChange={(e) =>
                          updateWebsiteSection(
                            "theme",
                            field,
                            e.target.value
                          )
                        }
                      />

                      <input
                        className="input-field"
                        value={
                          websiteSettings.theme?.[field] || ""
                        }
                        onChange={(e) =>
                          updateWebsiteSection(
                            "theme",
                            field,
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-3 gap-4 mt-5">
                <div>
                  <label className="block text-sm font-semibold text-accent-navy mb-1">
                    Font Family
                  </label>

                  <select
                    className="input-field"
                    value={
                      websiteSettings.theme?.fontFamily || "Inter"
                    }
                    onChange={(e) =>
                      updateWebsiteSection(
                        "theme",
                        "fontFamily",
                        e.target.value
                      )
                    }
                  >
                    <option>Inter</option>
                    <option>Arial</option>
                    <option>Georgia</option>
                    <option>Verdana</option>
                    <option>Tahoma</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-accent-navy mb-1">
                    Heading Size
                  </label>

                  <input
                    type="number"
                    min="24"
                    max="80"
                    className="input-field"
                    value={
                      websiteSettings.theme?.headingSize || 48
                    }
                    onChange={(e) =>
                      updateWebsiteSection(
                        "theme",
                        "headingSize",
                        Number(e.target.value)
                      )
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-accent-navy mb-1">
                    Body Size
                  </label>

                  <input
                    type="number"
                    min="12"
                    max="24"
                    className="input-field"
                    value={websiteSettings.theme?.bodySize || 16}
                    onChange={(e) =>
                      updateWebsiteSection(
                        "theme",
                        "bodySize",
                        Number(e.target.value)
                      )
                    }
                  />
                </div>
              </div>
            </div>

            {/* SECTION TYPOGRAPHY */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h4 className="font-bold text-accent-navy">
                Section Typography & Alignment
              </h4>

              <p className="text-sm text-text-light mt-1 mb-5">
                Customize headings and text for individual website sections.
              </p>

              <div className="grid xl:grid-cols-2 gap-5">
                {["hero", "about", "doctor", "services", "contact"].map(
                  (section) => (
                    <div
                      key={section}
                      className="rounded-2xl border border-[#F0D8DD] p-5 bg-[#FFF7F8]"
                    >
                      <h5 className="font-bold text-[#7A2033] capitalize mb-4">
                        {section} Section
                      </h5>

                      {["heading", "text"].map((element) => {
                        const style =
                          websiteSettings.contentStyles?.[
                            section
                          ]?.[element] || {};

                        const defaultSize =
                          element === "heading" ? 36 : 16;

                        const defaultColor =
                          section === "hero"
                            ? "#FFFFFF"
                            : element === "heading"
                              ? "#33151B"
                              : "#4B5563";

                        return (
                          <div
                            key={element}
                            className="rounded-xl bg-white border border-slate-200 p-4 mb-4 last:mb-0"
                          >
                            <p className="text-sm font-bold text-[#7A2033] capitalize mb-3">
                              {element} Style
                            </p>

                            <div className="grid sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-accent-navy mb-1">
                                  Font Size
                                </label>

                                <input
                                  type="number"
                                  min={
                                    element === "heading"
                                      ? 20
                                      : 12
                                  }
                                  max={
                                    element === "heading"
                                      ? 96
                                      : 36
                                  }
                                  className="input-field"
                                  value={
                                    style.fontSize ||
                                    defaultSize
                                  }
                                  onChange={(e) =>
                                    updateContentStyle(
                                      section,
                                      element,
                                      "fontSize",
                                      Number(e.target.value)
                                    )
                                  }
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-accent-navy mb-1">
                                  Color
                                </label>

                                <div className="flex gap-2">
                                  <input
                                    type="color"
                                    className="h-11 w-12 rounded border"
                                    value={
                                      style.color ||
                                      defaultColor
                                    }
                                    onChange={(e) =>
                                      updateContentStyle(
                                        section,
                                        element,
                                        "color",
                                        e.target.value
                                      )
                                    }
                                  />

                                  <input
                                    className="input-field"
                                    value={
                                      style.color ||
                                      defaultColor
                                    }
                                    onChange={(e) =>
                                      updateContentStyle(
                                        section,
                                        element,
                                        "color",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-accent-navy mb-1">
                                  Alignment
                                </label>

                                <select
                                  className="input-field"
                                  value={
                                    style.align ||
                                    (["services", "doctor"].includes(section)
                                      ? "center"
                                      : "left")
                                  }
                                  onChange={(e) =>
                                    updateContentStyle(
                                      section,
                                      element,
                                      "align",
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="left">
                                    Left
                                  </option>

                                  <option value="center">
                                    Center
                                  </option>

                                  <option value="right">
                                    Right
                                  </option>
                                </select>
                              </div>
                            </div>

                            <div
                              className="mt-3 rounded-lg border border-slate-200 bg-[#FFF7F8] p-3"
                              style={{
                                fontSize: `${
                                  style.fontSize ||
                                  defaultSize
                                }px`,
                                color:
                                  style.color ||
                                  defaultColor,
                                textAlign:
                                  style.align ||
                                  (section === "services"
                                    ? "center"
                                    : "left"),
                              }}
                            >
                              {element === "heading"
                                ? `${
                                    section[0].toUpperCase() +
                                    section.slice(1)
                                  } heading preview`
                                : `This is a preview of ${section} section text.`}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}
{/* =========================================================
    WEBSITE SEO ASSISTANT
========================================================= */}

<div className="border-t border-slate-100 pt-6">
  {(() => {
    const seo = websiteSettings.seo || {};
    const home = seo.home || {};
    const openGraph = seo.openGraph || {};
    const localSeo = seo.localSeo || {};

    const seoTitle = home.title || seo.defaultTitle || "";
    const metaDescription =
      home.metaDescription || seo.defaultMetaDescription || "";

    const keyword = String(
      home.primaryKeyword || seo.primaryKeyword || ""
    )
      .trim()
      .toLowerCase();

    const containsKeyword = (value = "") =>
      Boolean(keyword) &&
      String(value).toLowerCase().includes(keyword);

    const checks = [
      {
        label: "Primary keyword is set",
        passed: Boolean(keyword),
      },
      {
        label: "Keyword appears in Home SEO title",
        passed: containsKeyword(seoTitle),
      },
      {
        label: "Keyword appears in Home meta description",
        passed: containsKeyword(metaDescription),
      },
      {
        label: "SEO title is 30–60 characters",
        passed:
          seoTitle.length >= 30 &&
          seoTitle.length <= 60,
      },
      {
        label: "Meta description is 120–160 characters",
        passed:
          metaDescription.length >= 120 &&
          metaDescription.length <= 160,
      },
      {
        label: "Canonical URL is provided",
        passed: Boolean(home.canonicalUrl),
      },
      {
        label: "Open Graph title is provided",
        passed: Boolean(openGraph.title),
      },
      {
        label: "Open Graph image is provided",
        passed: Boolean(openGraph.image),
      },
      {
        label: "Clinic / business name is provided",
        passed: Boolean(localSeo.businessName),
      },
      {
        label: "Clinic address is provided",
        passed: Boolean(localSeo.address),
      },
    ];

    const passed = checks.filter(
      (check) => check.passed
    ).length;

    const score = Math.round(
      (passed / checks.length) * 100
    );

    return (
      <div className="rounded-2xl border border-[#f2c7cf] bg-white overflow-hidden shadow-sm">

        {/* HEADER */}

        <div className="p-5 bg-gradient-to-r from-[#7A2033] to-[#CF3650] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/70">
              Website SEO Assistant
            </p>

            <h3 className="text-xl font-bold mt-1">
              Optimize your website for search
            </h3>

            <p className="text-sm text-white/75 mt-1">
              Manage website metadata, home page SEO,
              social sharing and local search visibility.
            </p>
          </div>

          <div className="w-20 h-20 rounded-full bg-white/15 border-4 border-white/30 flex flex-col items-center justify-center shrink-0">

            <span className="text-2xl font-bold">
              {score}
            </span>

            <span className="text-[10px] uppercase tracking-wide">
              SEO Score
            </span>

          </div>
        </div>

        {/* TABS */}

        <div className="flex flex-wrap border-b border-slate-100 bg-[#FFF7F8]">

          {[
            "general",
            "home",
            "social",
            "local",
            "analysis",
          ].map((tab) => (

            <button
              key={tab}
              type="button"
              onClick={() => setWebsiteSeoTab(tab)}
              className={`px-5 py-3 text-sm font-semibold capitalize border-b-2 transition ${
                websiteSeoTab === tab
                  ? "border-[#CF3650] text-[#7A2033] bg-white"
                  : "border-transparent text-slate-500"
              }`}
            >
              {tab}
            </button>

          ))}

        </div>

        <div className="p-5">

          {/* =============================================
              GENERAL SEO
          ============================================= */}

          {websiteSeoTab === "general" && (

            <div className="space-y-4">

              <div className="grid md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-semibold text-accent-navy mb-1">
                    Site Name
                  </label>

                  <input
                    className="input-field"
                    placeholder="Elite Gynaecology"
                    value={seo.siteName || ""}
                    onChange={(e) =>
                      updateSeoField(
                        "siteName",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-accent-navy mb-1">
                    Primary Target Keyword
                  </label>

                  <input
                    className="input-field"
                    placeholder="gynaecologist in Lahore"
                    value={seo.primaryKeyword || ""}
                    onChange={(e) =>
                      updateSeoField(
                        "primaryKeyword",
                        e.target.value
                      )
                    }
                  />
                </div>

              </div>

              <div>
                <div className="flex justify-between gap-3">
                  <label className="block text-sm font-semibold text-accent-navy mb-1">
                    Default SEO Title
                  </label>

                  <span className="text-xs text-text-light">
                    {(seo.defaultTitle || "").length}/60
                  </span>
                </div>

                <input
                  className="input-field"
                  placeholder="Default website SEO title"
                  value={seo.defaultTitle || ""}
                  onChange={(e) =>
                    updateSeoField(
                      "defaultTitle",
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <div className="flex justify-between gap-3">

                  <label className="block text-sm font-semibold text-accent-navy mb-1">
                    Default Meta Description
                  </label>

                  <span className="text-xs text-text-light">
                    {(seo.defaultMetaDescription || "").length}
                    /160
                  </span>

                </div>

                <textarea
                  rows="4"
                  className="input-field"
                  placeholder="Default description for search engines..."
                  value={seo.defaultMetaDescription || ""}
                  onChange={(e) =>
                    updateSeoField(
                      "defaultMetaDescription",
                      e.target.value
                    )
                  }
                />

              </div>

              <div>
                <label className="block text-sm font-semibold text-accent-navy mb-1">
                  Secondary Keywords
                </label>

                <input
                  className="input-field"
                  placeholder="women's health, pregnancy care, gynae oncology"
                  value={(seo.secondaryKeywords || []).join(
                    ", "
                  )}
                  onChange={(e) =>
                    updateSeoField(
                      "secondaryKeywords",
                      commaStringToArray(
                        e.target.value
                      )
                    )
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-accent-navy mb-1">
                  Meta Keywords
                </label>

                <input
                  className="input-field"
                  placeholder="keyword one, keyword two"
                  value={(seo.metaKeywords || []).join(", ")}
                  onChange={(e) =>
                    updateSeoField(
                      "metaKeywords",
                      commaStringToArray(
                        e.target.value
                      )
                    )
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-accent-navy mb-1">
                  Target Location
                </label>

                <input
                  className="input-field"
                  placeholder="Lahore, Pakistan"
                  value={seo.targetLocation || ""}
                  onChange={(e) =>
                    updateSeoField(
                      "targetLocation",
                      e.target.value
                    )
                  }
                />
              </div>

            </div>

          )}

          {/* =============================================
              HOME PAGE SEO
          ============================================= */}

          {websiteSeoTab === "home" && (

            <div className="space-y-4">

              <div>
                <label className="block text-sm font-semibold text-accent-navy mb-1">
                  Focus Keyword
                </label>

                <input
                  className="input-field"
                  placeholder="e.g. gynaecologist in Lahore"
                  value={home.primaryKeyword || ""}
                  onChange={(e) =>
                    updateSeoNestedField(
                      "home",
                      "primaryKeyword",
                      e.target.value
                    )
                  }
                />

                <p className="text-xs text-text-light mt-1">
                  Main search phrase for the website home
                  page.
                </p>
              </div>

              <div>

                <div className="flex justify-between gap-3">

                  <label className="block text-sm font-semibold text-accent-navy mb-1">
                    Home SEO Title
                  </label>

                  <span className="text-xs text-text-light">
                    {(home.title || "").length}/60
                  </span>

                </div>

                <input
                  className="input-field"
                  placeholder="Home page SEO title"
                  value={home.title || ""}
                  onChange={(e) =>
                    updateSeoNestedField(
                      "home",
                      "title",
                      e.target.value
                    )
                  }
                />

              </div>

              <div>

                <div className="flex justify-between gap-3">

                  <label className="block text-sm font-semibold text-accent-navy mb-1">
                    Meta Description
                  </label>

                  <span className="text-xs text-text-light">
                    {(home.metaDescription || "").length}
                    /160
                  </span>

                </div>

                <textarea
                  rows="4"
                  className="input-field"
                  placeholder="Write the home page search description..."
                  value={home.metaDescription || ""}
                  onChange={(e) =>
                    updateSeoNestedField(
                      "home",
                      "metaDescription",
                      e.target.value
                    )
                  }
                />

              </div>

              <div>
                <label className="block text-sm font-semibold text-accent-navy mb-1">
                  Secondary Keywords
                </label>

                <input
                  className="input-field"
                  value={(home.secondaryKeywords || []).join(
                    ", "
                  )}
                  onChange={(e) =>
                    updateSeoNestedField(
                      "home",
                      "secondaryKeywords",
                      commaStringToArray(
                        e.target.value
                      )
                    )
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-accent-navy mb-1">
                  Meta Keywords
                </label>

                <input
                  className="input-field"
                  value={(home.metaKeywords || []).join(", ")}
                  onChange={(e) =>
                    updateSeoNestedField(
                      "home",
                      "metaKeywords",
                      commaStringToArray(
                        e.target.value
                      )
                    )
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-accent-navy mb-1">
                  Canonical URL
                </label>

                <input
                  className="input-field"
                  placeholder="https://elite-gynaecology.vercel.app/"
                  value={home.canonicalUrl || ""}
                  onChange={(e) =>
                    updateSeoNestedField(
                      "home",
                      "canonicalUrl",
                      e.target.value
                    )
                  }
                />
              </div>

              <label className="flex items-center gap-3">

                <input
                  type="checkbox"
                  checked={home.indexPage !== false}
                  onChange={(e) =>
                    updateSeoNestedField(
                      "home",
                      "indexPage",
                      e.target.checked
                    )
                  }
                />

                <span className="text-sm font-medium text-accent-navy">
                  Allow search engines to index the home
                  page
                </span>

              </label>

              {/* GOOGLE PREVIEW */}

              <div className="pt-4 border-t border-slate-100">

                <p className="text-xs uppercase tracking-[0.16em] font-bold text-[#CF3650]">
                  Search Preview
                </p>

                <div className="mt-3 rounded-xl border border-slate-200 p-4">

                  <p className="text-xs text-green-700">
                    {home.canonicalUrl ||
                      "https://elite-gynaecology.vercel.app/"}
                  </p>

                  <p className="text-xl text-[#1a0dab] mt-1">
                    {home.title ||
                      seo.defaultTitle ||
                      "Elite Gynaecology"}
                  </p>

                  <p className="text-sm text-slate-600 mt-2 leading-6">
                    {home.metaDescription ||
                      seo.defaultMetaDescription ||
                      "Add a meta description to preview how your website may appear in Google."}
                  </p>

                </div>
              </div>

            </div>

          )}

          {/* =============================================
              SOCIAL / OPEN GRAPH
          ============================================= */}

          {websiteSeoTab === "social" && (

            <div className="grid lg:grid-cols-2 gap-5">

              <div className="space-y-4">

                <div>
                  <label className="block text-sm font-semibold text-accent-navy mb-1">
                    Open Graph Title
                  </label>

                  <input
                    className="input-field"
                    value={openGraph.title || ""}
                    onChange={(e) =>
                      updateSeoNestedField(
                        "openGraph",
                        "title",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-accent-navy mb-1">
                    Open Graph Description
                  </label>

                  <textarea
                    rows="4"
                    className="input-field"
                    value={openGraph.description || ""}
                    onChange={(e) =>
                      updateSeoNestedField(
                        "openGraph",
                        "description",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-accent-navy mb-1">
                    Open Graph Image
                  </label>

                  <input
                    className="input-field"
                    placeholder="/image.jpg or https://..."
                    value={openGraph.image || ""}
                    onChange={(e) =>
                      updateSeoNestedField(
                        "openGraph",
                        "image",
                        e.target.value
                      )
                    }
                  />
                </div>

              </div>

              {/* SOCIAL PREVIEW */}

              <div className="rounded-xl border border-slate-200 overflow-hidden self-start">

                {openGraph.image ? (

                  <img
                    src={openGraph.image}
                    alt={
                      openGraph.title ||
                      "Elite Gynaecology social preview"
                    }
                    className="w-full h-44 object-cover"
                  />

                ) : (

                  <div className="h-44 bg-[#FFF1F4] flex items-center justify-center text-sm text-[#7A2033]">
                    Social image preview
                  </div>

                )}

                <div className="p-4 bg-[#FFF7F8]">

                  <p className="text-[11px] uppercase text-slate-500">
                    ELITE-GYNAECOLOGY.VERCEL.APP
                  </p>

                  <p className="font-bold text-accent-navy mt-1">
                    {openGraph.title ||
                      home.title ||
                      seo.defaultTitle ||
                      "Elite Gynaecology"}
                  </p>

                  <p className="text-sm text-text-light mt-2">
                    {openGraph.description ||
                      home.metaDescription ||
                      seo.defaultMetaDescription ||
                      "Website social sharing description"}
                  </p>

                </div>

              </div>

            </div>

          )}

          {/* =============================================
              LOCAL SEO
          ============================================= */}

          {websiteSeoTab === "local" && (

            <div>

              <div className="rounded-xl border border-[#F0D8DD] bg-[#FFF7F8] p-4 mb-5">

                <p className="font-bold text-[#7A2033]">
                  Local Search Information
                </p>

                <p className="text-sm text-text-light mt-1">
                  Help search engines understand the clinic,
                  doctor and location.
                </p>

              </div>

              <div className="grid md:grid-cols-2 gap-4">

                {[
                  [
                    "businessName",
                    "Business / Clinic Name",
                  ],
                  ["doctorName", "Doctor Name"],
                  ["city", "City"],
                  ["country", "Country"],
                  ["phone", "Phone"],
                  ["address", "Address"],
                ].map(([field, label]) => (

                  <div
                    key={field}
                    className={
                      field === "address"
                        ? "md:col-span-2"
                        : ""
                    }
                  >

                    <label className="block text-sm font-semibold text-accent-navy mb-1">
                      {label}
                    </label>

                    <input
                      className="input-field"
                      value={localSeo[field] || ""}
                      onChange={(e) =>
                        updateSeoNestedField(
                          "localSeo",
                          field,
                          e.target.value
                        )
                      }
                    />

                  </div>

                ))}

              </div>

            </div>

          )}

          {/* =============================================
              SEO ANALYSIS
          ============================================= */}

          {websiteSeoTab === "analysis" && (

            <div>

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">

                <div>
                  <h4 className="font-bold text-accent-navy">
                    Website SEO Analysis
                  </h4>

                  <p className="text-sm text-text-light mt-1">
                    Improve failed checks to increase the
                    website SEO score.
                  </p>
                </div>

                <p className="text-sm font-semibold text-[#7A2033]">
                  {passed}/{checks.length} checks passed
                </p>

              </div>

              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden mb-5">

                <div
                  className="h-full bg-gradient-to-r from-[#7A2033] to-[#CF3650] transition-all"
                  style={{
                    width: `${score}%`,
                  }}
                />

              </div>

              <div className="space-y-2">

                {checks.map((check) => (

                  <div
                    key={check.label}
                    className={`flex items-center gap-3 rounded-xl border p-3 ${
                      check.passed
                        ? "border-green-200 bg-green-50"
                        : "border-[#f2c7cf] bg-[#FFF7F8]"
                    }`}
                  >

                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        check.passed
                          ? "bg-green-100 text-green-700"
                          : "bg-[#FFF1F4] text-[#CF3650]"
                      }`}
                    >
                      {check.passed ? "✓" : "!"}
                    </span>

                    <span
                      className={`text-sm font-medium ${
                        check.passed
                          ? "text-green-800"
                          : "text-[#7A2033]"
                      }`}
                    >
                      {check.label}
                    </span>

                  </div>

                ))}

              </div>

            </div>

          )}

        </div>
      </div>
    );
  })()}
</div>

        {/* =====================================================
            BOTTOM SAVE
        ===================================================== */}

        <div className="sticky bottom-4 z-20 mt-8 flex justify-end">
          <div className="rounded-2xl border border-[#F0D8DD] bg-white/95 shadow-lg p-2 backdrop-blur">
            <button
              type="button"
              onClick={saveWebsiteSettings}
              disabled={websiteSaving}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />

              {websiteSaving
                ? "Saving..."
                : "Save Website Changes"}
            </button>
          </div>
        </div>
      </>
    )}
  </section>
)}
        {/* =================================================
            BLOG MANAGEMENT
        ================================================== */}

        {activeSection === "blogs" && (
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

                {/* SEO ASSISTANT */}
                {(() => {
                  const stripHtml = (value = "") => value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
                  const keyword = blogForm.seo.focusKeyword.trim().toLowerCase();
                  const seoTitle = (blogForm.seo.seoTitle || blogForm.title).trim();
                  const metaDescription = blogForm.seo.metaDescription.trim();
                  const plainContent = stripHtml(blogForm.content);
                  const wordCount = plainContent ? plainContent.split(/\s+/).length : 0;
                  const slugText = blogForm.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                  const includesKeyword = (value = "") => keyword && value.toLowerCase().includes(keyword);
                  const checks = [
                    { label: "Focus keyword is set", pass: Boolean(keyword) },
                    { label: "Focus keyword appears in SEO title", pass: includesKeyword(seoTitle) },
                    { label: "Focus keyword appears in meta description", pass: includesKeyword(metaDescription) },
                    { label: "Focus keyword appears in the URL slug", pass: includesKeyword(slugText.replace(/-/g, " ")) },
                    { label: "Focus keyword appears in blog content", pass: includesKeyword(plainContent) },
                    { label: "SEO title is 30–60 characters", pass: seoTitle.length >= 30 && seoTitle.length <= 60 },
                    { label: "Meta description is 120–160 characters", pass: metaDescription.length >= 120 && metaDescription.length <= 160 },
                    { label: "Content has at least 300 words", pass: wordCount >= 300 },
                  ];
                  const passed = checks.filter((check) => check.pass).length;
                  const score = Math.round((passed / checks.length) * 100);
                  const updateSeo = (field, value) => setBlogForm((prev) => ({ ...prev, seo: { ...prev.seo, [field]: value } }));

                  return (
                    <div className="rounded-2xl border border-[#f2c7cf] bg-white overflow-hidden shadow-sm">
                      <div className="p-5 bg-gradient-to-r from-[#7A2033] to-[#CF3650] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-white/70">SEO Assistant</p>
                          <h3 className="text-xl font-bold mt-1">Optimize this blog for search</h3>
                          <p className="text-sm text-white/75 mt-1">Rank-Math-style guidance for search, social sharing and schema.</p>
                        </div>
                        <div className="w-20 h-20 rounded-full bg-white/15 border-4 border-white/30 flex flex-col items-center justify-center shrink-0">
                          <span className="text-2xl font-bold">{score}</span>
                          <span className="text-[10px] uppercase tracking-wide">SEO Score</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap border-b border-slate-100 bg-[#FFF7F8]">
                        {["general", "social", "schema", "analysis"].map((tab) => (
                          <button key={tab} type="button" onClick={() => setSeoTab(tab)} className={`px-5 py-3 text-sm font-semibold capitalize border-b-2 transition ${seoTab === tab ? "border-[#CF3650] text-[#7A2033] bg-white" : "border-transparent text-slate-500"}`}>
                            {tab}
                          </button>
                        ))}
                      </div>

                      <div className="p-5">
                        {seoTab === "general" && (
                          <div className="space-y-4">
                            <div><label className="block text-sm font-semibold text-accent-navy mb-1">Focus Keyword</label><input className="input-field" placeholder="e.g. PCOS treatment Lahore" value={blogForm.seo.focusKeyword} onChange={(e) => updateSeo("focusKeyword", e.target.value)} /><p className="text-xs text-text-light mt-1">Main search phrase you want this article to target.</p></div>
                            <div><div className="flex justify-between gap-3"><label className="block text-sm font-semibold text-accent-navy mb-1">SEO Title</label><span className="text-xs text-text-light">{seoTitle.length}/60</span></div><input className="input-field" placeholder={blogForm.title || "SEO title"} value={blogForm.seo.seoTitle} onChange={(e) => updateSeo("seoTitle", e.target.value)} /></div>
                            <div><div className="flex justify-between gap-3"><label className="block text-sm font-semibold text-accent-navy mb-1">Meta Description</label><span className="text-xs text-text-light">{metaDescription.length}/160</span></div><textarea rows="4" className="input-field" placeholder="Write a compelling search description..." value={blogForm.seo.metaDescription} onChange={(e) => updateSeo("metaDescription", e.target.value)} /></div>
                            <div><label className="block text-sm font-semibold text-accent-navy mb-1">Canonical URL</label><input className="input-field" placeholder="https://yourdomain.com/blog/article" value={blogForm.seo.canonicalUrl} onChange={(e) => updateSeo("canonicalUrl", e.target.value)} /></div>
                            <label className="flex items-center gap-3"><input type="checkbox" checked={blogForm.seo.indexPage !== false} onChange={(e) => updateSeo("indexPage", e.target.checked)} /><span className="text-sm font-medium text-accent-navy">Allow search engines to index this blog</span></label>
                          </div>
                        )}

                        {seoTab === "social" && (
                          <div className="grid lg:grid-cols-2 gap-5">
                            <div className="space-y-4"><div><label className="block text-sm font-semibold text-accent-navy mb-1">Social Title</label><input className="input-field" value={blogForm.seo.ogTitle} onChange={(e) => updateSeo("ogTitle", e.target.value)} /></div><div><label className="block text-sm font-semibold text-accent-navy mb-1">Social Description</label><textarea rows="4" className="input-field" value={blogForm.seo.ogDescription} onChange={(e) => updateSeo("ogDescription", e.target.value)} /></div><div><label className="block text-sm font-semibold text-accent-navy mb-1">Social Image URL</label><input className="input-field" value={blogForm.seo.ogImage} onChange={(e) => updateSeo("ogImage", e.target.value)} /></div></div>
                            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white"><div className="h-40 bg-[#FFF1F4] flex items-center justify-center overflow-hidden">{(blogForm.seo.ogImage || blogForm.featuredImage) ? <img src={blogForm.seo.ogImage || blogForm.featuredImage} alt="Social preview" className="w-full h-full object-cover" /> : <span className="text-sm text-text-light">Social image preview</span>}</div><div className="p-4"><p className="font-bold text-accent-navy">{blogForm.seo.ogTitle || seoTitle || "Your social title"}</p><p className="text-sm text-text-light mt-2">{blogForm.seo.ogDescription || metaDescription || blogForm.excerpt || "Your social description will appear here."}</p></div></div>
                          </div>
                        )}

                        {seoTab === "schema" && (
                          <div className="space-y-4"><div><label className="block text-sm font-semibold text-accent-navy mb-1">Schema Type</label><select className="input-field" value={blogForm.seo.schemaType} onChange={(e) => updateSeo("schemaType", e.target.value)}><option value="Article">Article</option><option value="BlogPosting">Blog Posting</option><option value="MedicalWebPage">Medical Web Page</option></select></div><div className="rounded-xl bg-[#FFF3E6] border border-[#F5A900]/30 p-4"><p className="font-semibold text-[#7A2033]">Structured data</p><p className="text-sm text-text-light mt-1">The selected schema type will be stored with this blog so the public blog page can later output matching JSON-LD structured data.</p></div></div>
                        )}

                        {seoTab === "analysis" && (
                          <div><div className="flex items-end justify-between gap-4 mb-4"><div><h4 className="font-bold text-accent-navy">SEO Analysis</h4><p className="text-sm text-text-light">{passed} of {checks.length} checks passed • {wordCount} content words</p></div><span className="text-2xl font-bold text-[#CF3650]">{score}%</span></div><div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-5"><div className="h-full bg-[#CF3650] transition-all" style={{ width: `${score}%` }} /></div><div className="space-y-2">{checks.map((check) => <div key={check.label} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${check.pass ? "bg-green-50 text-green-800" : "bg-[#FFF1F4] text-[#7A2033]"}`}><span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${check.pass ? "bg-green-100" : "bg-white"}`}>{check.pass ? "✓" : "!"}</span><span className="font-medium">{check.label}</span></div>)}</div></div>
                        )}
                      </div>
                    </div>
                  );
                })()}

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
        )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;