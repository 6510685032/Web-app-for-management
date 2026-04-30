import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import TopNavigation from "./TopNavigation";
import api from "../../utils/api";
import { User, Mail, Phone, Home, Calendar, ArrowLeft, Edit2, Save, X, CircleUserRound } from "lucide-react";

export default function ProfilePage() {
  const { user, updateUser } = useUser();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", unit_number: "" });

  useEffect(() => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      unit_number: user?.unit_number || "",
    });
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setErrorMessage("");
    try {
      const response = await api.patch("/me/", formData);
      const updated = response.data?.user || formData;
      updateUser({
        name: updated.name ?? formData.name,
        email: updated.email ?? formData.email,
        phone: updated.phone ?? formData.phone,
        unit_number: updated.unit_number ?? formData.unit_number,
      });
      setIsEditing(false);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.error || "Unable to save profile data.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      unit_number: user?.unit_number || ""
    });
    setErrorMessage("");
    setIsEditing(false);
  };

  const getRoleLabel = (role: string) => {
    const map: Record<string, string> = {
      admin: "System Administrator", officer: "Juristic Officer",
      technician: "Technician", resident: "Resident",
    };
    return map[role] || role;
  };

  const fields = [
    { key: "name", label: "Full Name", icon: <User className="w-5 h-5" />, type: "text" },
    { key: "email", label: "Email Address", icon: <Mail className="w-5 h-5" />, type: "email" },
    { key: "phone", label: "Phone Number", icon: <Phone className="w-5 h-5" />, type: "tel" },
    ...(user?.role === "resident" || user?.unit_number
      ? [{ key: "unit_number", label: "Unit Number", icon: <Home className="w-5 h-5" />, type: "text" }]
      : []),
  ];

  return (
    <div className="djmp-bg min-h-screen">
      <TopNavigation />
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8" style={{ position: "relative", zIndex: 1 }}>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-8 font-medium transition-colors"
          style={{ color: "var(--accent-500)" }}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        {/* Outer glowing border wrapper */}
        <div
          className="fade-in-up"
          style={{
            background: "linear-gradient(135deg, var(--accent-500), transparent 40%, transparent 60%, var(--accent-700))",
            padding: "1px",
            borderRadius: "24px",
            boxShadow: "0 10px 40px var(--accent-shimmer)",
          }}
        >
          {/* Inner Card Container */}
          <div
            style={{
              background: "var(--djmp-surface)",
              borderRadius: "23px",
              overflow: "hidden",
            }}
          >
            {/* Header Banner */}
            <div
              style={{
                position: "relative",
                padding: "48px 32px",
                background: "var(--accent-gradient)",
                overflow: "hidden",
              }}
            >
              {/* Decorative wave/grid effect overlay */}
              <div
                style={{
                  position: "absolute", inset: 0,
                  background: "radial-gradient(ellipse at bottom, rgba(255,255,255,0.15) 0%, transparent 60%)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute", bottom: 0, left: 0, right: 0, height: "40%",
                  background: "linear-gradient(to top, var(--djmp-surface), transparent)",
                  pointerEvents: "none",
                }}
              />

              <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex items-center gap-6">
                  {/* Avatar with glowing rings */}
                  <div
                    style={{
                      width: "100px", height: "100px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.2)",
                      border: "2px solid rgba(255,255,255,0.6)",
                      boxShadow: "0 0 0 6px rgba(255,255,255,0.15), 0 0 30px rgba(255,255,255,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "white", fontSize: "36px", fontWeight: "bold",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-3 tracking-wide">
                      {user?.name || "User Name"}
                    </h1>
                    <span
                      style={{
                        padding: "6px 20px",
                        borderRadius: "20px",
                        background: "rgba(255,255,255,0.15)",
                        border: "1px solid rgba(255,255,255,0.3)",
                        color: "white",
                        fontSize: "14px",
                        fontWeight: "500",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      {getRoleLabel(user?.role || "")}
                    </span>
                  </div>
                </div>

                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      padding: "10px 24px",
                      borderRadius: "20px",
                      background: "rgba(255,255,255,0.15)",
                      border: "1px solid rgba(255,255,255,0.4)",
                      color: "white",
                      fontSize: "15px",
                      fontWeight: "600",
                      backdropFilter: "blur(8px)",
                      transition: "all 0.2s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                  >
                    <Edit2 className="w-4 h-4" /> Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Profile Content Body */}
            <div className="p-8 pb-12">
              <div className="flex items-center gap-3 mb-6">
                <div
                  style={{
                    width: "40px", height: "40px",
                    borderRadius: "50%",
                    background: "var(--djmp-surface-2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1px solid var(--djmp-border)",
                  }}
                >
                  <CircleUserRound className="w-5 h-5" style={{ color: "var(--djmp-text-muted)" }} />
                </div>
                <h2 className="text-xl font-bold tracking-wide" style={{ color: "var(--djmp-text)" }}>
                  Personal Information
                </h2>
              </div>

              {errorMessage && (
                <div
                  className="mb-6 rounded-xl px-4 py-3 text-sm"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}
                >
                  {errorMessage}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                {fields.map((field) => (
                  <div
                    key={field.key}
                    style={{
                      background: "var(--djmp-surface-2)",
                      border: "1px solid var(--djmp-border)",
                      borderRadius: "16px",
                      padding: "20px",
                      display: "flex", alignItems: "center", gap: "16px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div
                      style={{
                        width: "48px", height: "48px",
                        borderRadius: "14px",
                        background: "var(--accent-shimmer)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "var(--accent-400)",
                        flexShrink: 0,
                      }}
                    >
                      {field.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--accent-500)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        {field.label}
                      </div>
                      {isEditing ? (
                        <input
                          type={field.type}
                          value={formData[field.key as keyof typeof formData]}
                          onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                          className="djmp-input w-full mt-1 h-10 text-sm"
                          disabled={saving}
                        />
                      ) : (
                        <div style={{ fontSize: "16px", fontWeight: "500", color: "var(--djmp-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {(user as any)?.[field.key] || "—"}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Member Since — read-only */}
                <div
                  style={{
                    background: "var(--djmp-surface-2)",
                    border: "1px solid var(--djmp-border)",
                    borderRadius: "16px",
                    padding: "20px",
                    display: "flex", alignItems: "center", gap: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "48px", height: "48px",
                      borderRadius: "14px",
                      background: "var(--accent-shimmer)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "var(--accent-400)",
                      flexShrink: 0,
                    }}
                  >
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--accent-500)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Member Since
                    </div>
                    <div style={{ fontSize: "16px", fontWeight: "500", color: "var(--djmp-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {user?.joinDate
                        ? new Date(user.joinDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                        : "April 30, 2026"}
                    </div>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-4 mt-8 pt-6" style={{ borderTop: "1px solid var(--djmp-border)" }}>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-accent flex-1 flex items-center justify-center gap-2 py-3 rounded-xl"
                  >
                    <Save className="w-5 h-5" />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-colors font-semibold"
                    style={{ background: "var(--djmp-surface-2)", border: "1px solid var(--djmp-border)", color: "var(--djmp-text)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--accent-shimmer)"}
                    onMouseLeave={e => e.currentTarget.style.background = "var(--djmp-surface-2)"}
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}