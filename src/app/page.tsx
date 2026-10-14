"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Users,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Plus,
  Search,
  Smartphone,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Lock,
  Unlock,
  Trash2,
  Building2,
  RefreshCw,
  Send,
  Eye,
  EyeOff,
  BarChart3,
  Check,
  Database,
  Infinity
} from "lucide-react";

interface MerchantItem {
  id: string;
  businessName: string;
  email: string;
  passwordHash: string;
  planName: string;
  daysDuration: number;
  priceSoles: number;
  status: "ACTIVE" | "EXPIRED" | "SUSPENDED";
  boundDeviceId: string | null;
  firstLoginAt: string | null;
  expiresAt: string;
  createdAt: string;
}

interface BiData {
  totalMerchants: number;
  activeMerchants: number;
  expiredMerchants: number;
  suspendedMerchants: number;
  totalRevenue: number;
  activeRevenue: number;
  boundDevices?: number;
  planBreakdown: {
    lifetime?: number;
    monthly?: number;
    quarterly?: number;
    annual?: number;
  };
}

type TabType = "bi" | "merchants" | "create" | "database";

export default function AppleAdminDashboard() {
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginShowPass, setLoginShowPass] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<TabType>("merchants");
  const [merchants, setMerchants] = useState<MerchantItem[]>([]);
  const [biStats, setBiStats] = useState<BiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [visiblePasswords, setVisiblePasswords] = useState<{ [id: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State para Nuevo Comercio
  const [formBusinessName, setFormBusinessName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdSuccess, setCreatedSuccess] = useState<MerchantItem | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("punk_admin_token");
    if (saved) {
      setAdminToken(saved);
      fetchData(saved);
    } else {
      setAuthChecking(false);
      setLoading(false);
    }
    generateRandomPassword();
  }, []);

  async function authFetch(url: string, options: RequestInit = {}, customToken?: string) {
    const token = customToken || adminToken || localStorage.getItem("punk_admin_token") || "";
    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    };
    return fetch(url, { ...options, headers });
  }

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const res = await fetch("/api/auth/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUser, password: loginPass }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        localStorage.setItem("punk_admin_token", data.token);
        setAdminToken(data.token);
        setAuthChecking(false);
        fetchData(data.token);
      } else {
        setLoginError(data.message || "Usuario o contraseña de administrador incorrectos.");
      }
    } catch (err: any) {
      setLoginError("Error de conexión al servidor de autenticación.");
    } finally {
      setLoginLoading(false);
    }
  }

  function handleAdminLogout() {
    localStorage.removeItem("punk_admin_token");
    setAdminToken(null);
    setMerchants([]);
    setBiStats(null);
    setLoginPass("");
    setLoginError(null);
  }

  async function fetchData(tokenToUse?: string) {
    setLoading(true);
    try {
      const [merchantsRes, biRes] = await Promise.all([
        authFetch("/api/merchants", {}, tokenToUse),
        authFetch("/api/bi/stats", {}, tokenToUse),
      ]);

      if (merchantsRes.status === 401 || biRes.status === 401) {
        handleAdminLogout();
        return;
      }

      const mData = await merchantsRes.json();
      const bData = await biRes.json();

      const list = mData.data || mData.merchants || [];
      setMerchants(list);

      if (bData.metrics) {
        setBiStats(bData.metrics);
      } else {
        setBiStats({
          totalMerchants: list.length,
          activeMerchants: list.filter((m: any) => m.status === "ACTIVE").length,
          expiredMerchants: 0,
          suspendedMerchants: list.filter((m: any) => m.status === "SUSPENDED").length,
          totalRevenue: list.length * 10.0,
          activeRevenue: list.length * 10.0,
          planBreakdown: { lifetime: list.length },
        });
      }
    } catch (err) {
      console.error("Error al cargar datos:", err);
    } finally {
      setLoading(false);
      setAuthChecking(false);
    }
  }

  function generateRandomPassword() {
    const chars = "abcdefghjkmnpqrstuvwxyz23456789";
    let res = "punk";
    for (let i = 0; i < 4; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormPassword(res);
  }

  async function handleCreateMerchant(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);

    const cleanName = formBusinessName.trim();
    const cleanEmail = formEmail.trim().toLowerCase();
    const cleanPass = formPassword.trim();

    if (!cleanName || !cleanEmail || !cleanPass) {
      setCreateError("Por favor completa todos los campos.");
      return;
    }

    setCreating(true);
    try {
      const res = await authFetch("/api/merchants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: cleanName,
          email: cleanEmail,
          password: cleanPass,
          passwordHash: cleanPass,
          planName: "Pago Único Vitalicio (De por vida)",
          daysDuration: 36500,
          priceSoles: 10.0,
        }),
      });

      const data = await res.json();
      const createdItem = data.data || data.merchant;

      if (res.ok && createdItem) {
        setCreatedSuccess(createdItem);
        setMerchants((prev) => [createdItem, ...prev]);
        fetchData();
      } else {
        setCreateError(data.message || "No se pudo registrar el comercio. Revisa los datos.");
      }
    } catch (err: any) {
      console.error("Error creando comercio:", err);
      setCreateError(err.message || "Error de red al crear el comercio.");
    } finally {
      setCreating(false);
    }
  }

  function handleResetForm() {
    setFormBusinessName("");
    setFormEmail("");
    generateRandomPassword();
    setCreateError(null);
    setCreatedSuccess(null);
  }

  async function handleResetDevice(id: string) {
    if (!confirm("¿Deseas desvincular el celular actual? El cliente podrá iniciar sesión en su nuevo equipo.")) return;
    try {
      const res = await authFetch("/api/merchants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "RESET_DEVICE" }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleToggleStatus(merchant: MerchantItem) {
    const nextStatus = merchant.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const res = await authFetch("/api/merchants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: merchant.id, action: "TOGGLE_STATUS", status: nextStatus }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteMerchant(id: string) {
    if (!confirm("¿Seguro que deseas eliminar definitivamente este registro de comercio?")) return;
    try {
      const res = await authFetch(`/api/merchants?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setMerchants((prev) => prev.filter((m) => m.id !== id));
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  }

  const filteredMerchants = merchants.filter((m) => {
    const matchesSearch =
      m.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.boundDeviceId && m.boundDeviceId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!adminToken) {
    if (authChecking) {
      return (
        <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[#0071E3]" />
            <p className="text-xs text-[#86868B] font-medium">Verificando sesión administrativa...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F5F5F7] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="mx-auto w-16 h-16 rounded-2xl overflow-hidden bg-white shadow-md border border-black/[0.08] flex items-center justify-center p-1">
            <Image
              src="/logo_p_solo.png"
              alt="Punk Logo"
              width={64}
              height={64}
              className="object-cover rounded-xl"
              priority
            />
          </div>
          <h2 className="mt-6 text-center text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
            Punk Control
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-[#86868B]">
            Panel exclusivo para el Administrador de Licencias
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 sm:px-10 shadow-sm rounded-3xl border border-black/[0.06]">
            {loginError && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 font-medium">{loginError}</p>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6E73] mb-1.5">
                  Usuario o Correo Administrador
                </label>
                <input
                  type="text"
                  required
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  placeholder="admin o admin@punk.com"
                  className="w-full px-4 py-3 rounded-xl border border-[#D2D2D7] bg-[#FBFBFD] text-sm text-[#1D1D1F] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6E73] mb-1.5">
                  Contraseña Maestra
                </label>
                <div className="relative">
                  <input
                    type={loginShowPass ? "text" : "password"}
                    required
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-[#D2D2D7] bg-[#FBFBFD] text-sm text-[#1D1D1F] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent transition pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setLoginShowPass(!loginShowPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {loginShowPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full mt-2 flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-[#0071E3] hover:bg-[#0077ED] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0071E3] shadow-sm transition disabled:opacity-50"
              >
                {loginLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  "Iniciar Sesión como Administrador"
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-black/[0.06] text-center">
              <span className="text-[11px] text-[#86868B]">
                Acceso encriptado exclusivo para el propietario de la plataforma
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
      {/* CABECERA ESTILO APPLE: MINIMALISTA, ESPACIOSA Y ELEGANTE */}
      <header className="sticky top-0 z-30 bg-[#F5F5F7]/85 backdrop-blur-md border-b border-black/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-white shadow-sm border border-black/[0.08] flex items-center justify-center">
              <Image
                src="/logo_p_solo.png"
                alt="Punk Logo"
                width={44}
                height={44}
                className="object-cover"
                priority
              />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl font-bold tracking-tight text-[#1D1D1F]">Punk</h1>
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-black/[0.05] text-[#6E6E73]">
                  Admin Suite
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#34C759]/15 text-[#248A3D]">
                  S/. 10 Pago Único Vitalicio
                </span>
              </div>
              <p className="text-xs text-[#86868B]">
                Gestión Centralizada de Licencias Vitalicias & Protección Anti-Piratería
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 bg-white px-3.5 py-1.5 rounded-full border border-black/[0.06] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#34C759]"></span>
              <span className="text-xs font-medium text-[#6E6E73]">Admin Activo</span>
            </div>

            <button
              onClick={() => fetchData()}
              className="p-2 rounded-full bg-white border border-black/[0.08] hover:bg-gray-50 text-[#6E6E73] hover:text-[#1D1D1F] transition shadow-sm"
              title="Actualizar datos"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={handleAdminLogout}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 text-xs font-semibold transition shadow-sm"
              title="Cerrar Sesión de Administrador"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          </div>
        </div>

        {/* NAVEGACIÓN POR PESTAÑAS (SEGMENTED CONTROL DE APPLE) */}
        <div className="max-w-6xl mx-auto px-6 pb-4">
          <div className="inline-flex p-1 bg-[#E5E5EA]/70 rounded-xl space-x-1 border border-black/[0.04]">
            <button
              onClick={() => setActiveTab("merchants")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === "merchants"
                  ? "bg-white text-[#1D1D1F] shadow-sm"
                  : "text-[#6E6E73] hover:text-[#1D1D1F]"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Comercios & Licencias</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/[0.06] text-[10px] text-[#6E6E73]">
                {merchants.length}
              </span>
            </button>

            <button
              onClick={() => {
                if (!formPassword) generateRandomPassword();
                setActiveTab("create");
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === "create"
                  ? "bg-[#0071E3] text-white shadow-sm"
                  : "text-[#0071E3] hover:bg-black/[0.03]"
              }`}
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+ Nuevo Comercio (S/. 10)</span>
            </button>

            <button
              onClick={() => setActiveTab("bi")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === "bi"
                  ? "bg-white text-[#1D1D1F] shadow-sm"
                  : "text-[#6E6E73] hover:text-[#1D1D1F]"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Métricas & BI</span>
            </button>

            <button
              onClick={() => setActiveTab("database")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === "database"
                  ? "bg-white text-[#1D1D1F] shadow-sm"
                  : "text-[#6E6E73] hover:text-[#1D1D1F]"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Base de Datos</span>
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* ========================================================= */}
        {/* PESTAÑA 1: COMERCIOS & LICENCIAS (VISTA PRINCIPAL) */}
        {/* ========================================================= */}
        {activeTab === "merchants" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">
                  Comercios & Licencias Vitalicias
                </h2>
                <p className="text-sm text-[#86868B] mt-1">
                  Clientes con acceso permanente de S/. 10.00 de por vida (sin renovaciones).
                </p>
              </div>

              <button
                onClick={() => {
                  if (!formPassword) generateRandomPassword();
                  setActiveTab("create");
                }}
                className="inline-flex items-center space-x-2 bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Registrar Nuevo Comercio</span>
              </button>
            </div>

            {/* BARRA DE FILTROS Y BÚSQUEDA APPLE */}
            <div className="bg-white rounded-2xl p-4 border border-black/[0.06] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative flex-1 w-full max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868B]" />
                <input
                  type="text"
                  placeholder="Buscar por negocio, correo o celular vinculado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#F5F5F7] border border-black/[0.06] rounded-xl pl-10 pr-4 py-2 text-xs text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition"
                />
              </div>

              <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                {["ALL", "ACTIVE", "SUSPENDED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      statusFilter === st
                        ? "bg-[#1D1D1F] text-white"
                        : "bg-[#F5F5F7] text-[#6E6E73] hover:text-[#1D1D1F]"
                    }`}
                  >
                    {st === "ALL" && "Todos"}
                    {st === "ACTIVE" && "Activos de por vida"}
                    {st === "SUSPENDED" && "Suspendidos"}
                  </button>
                ))}
              </div>
            </div>

            {/* TABLA ESTILO NUMBERS / APPLE SETTINGS */}
            <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#1D1D1F]">
                  <thead className="bg-[#FBFBFD] text-[11px] font-semibold text-[#86868B] uppercase tracking-wider border-b border-black/[0.06]">
                    <tr>
                      <th className="py-4 px-5">Comercio</th>
                      <th className="py-4 px-5">Credenciales de Acceso</th>
                      <th className="py-4 px-5">Modalidad & Precio</th>
                      <th className="py-4 px-5">Vigencia</th>
                      <th className="py-4 px-5">Celular Vinculado</th>
                      <th className="py-4 px-5">Estado</th>
                      <th className="py-4 px-5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04]">
                    {filteredMerchants.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-[#86868B]">
                          No se encontraron comercios registrados. Usa la pestaña "+ Nuevo Comercio" para registrar el primero.
                        </td>
                      </tr>
                    ) : (
                      filteredMerchants.map((merchant) => {
                        const isPassVisible = visiblePasswords[merchant.id];

                        return (
                          <tr key={merchant.id} className="hover:bg-[#F5F5F7]/60 transition">
                            {/* Comercio */}
                            <td className="py-4 px-5">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-xl bg-[#0071E3]/10 text-[#0071E3] font-bold text-xs flex items-center justify-center">
                                  {merchant.businessName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-semibold text-[#1D1D1F]">
                                    {merchant.businessName}
                                  </div>
                                  <div className="text-[11px] text-[#86868B]">{merchant.email}</div>
                                </div>
                              </div>
                            </td>

                            {/* Credenciales */}
                            <td className="py-4 px-5">
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-xs bg-[#F5F5F7] px-2.5 py-1 rounded-md text-[#1D1D1F] border border-black/[0.04]">
                                  {isPassVisible ? merchant.passwordHash : "••••••••"}
                                </span>
                                <button
                                  onClick={() =>
                                    setVisiblePasswords((prev) => ({
                                      ...prev,
                                      [merchant.id]: !prev[merchant.id],
                                    }))
                                  }
                                  className="text-[#86868B] hover:text-[#1D1D1F] p-1"
                                  title={isPassVisible ? "Ocultar clave" : "Mostrar clave"}
                                >
                                  {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  onClick={() => copyToClipboard(merchant.passwordHash, `pass-${merchant.id}`)}
                                  className="text-[#86868B] hover:text-[#0071E3] p-1"
                                  title="Copiar contraseña"
                                >
                                  {copiedId === `pass-${merchant.id}` ? (
                                    <Check className="w-3.5 h-3.5 text-[#34C759]" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>

                            {/* Modalidad & Precio */}
                            <td className="py-4 px-5">
                              <div className="font-semibold text-[#1D1D1F]">Pago Único</div>
                              <div className="text-[11px] text-[#34C759] font-medium">S/. 10.00</div>
                            </td>

                            {/* Vigencia */}
                            <td className="py-4 px-5">
                              <div className="inline-flex items-center space-x-1 text-[#248A3D] font-semibold text-xs">
                                <Infinity className="w-3.5 h-3.5 text-[#34C759]" />
                                <span>De por vida</span>
                              </div>
                              <div className="text-[10px] text-[#86868B]">Sin renovaciones</div>
                            </td>

                            {/* Dispositivo Celular Vinculado */}
                            <td className="py-4 px-5">
                              {merchant.boundDeviceId ? (
                                <div className="flex items-center space-x-2">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono bg-[#34C759]/10 text-[#248A3D] border border-[#34C759]/20">
                                    <Lock className="w-3 h-3 mr-1" />
                                    {merchant.boundDeviceId.slice(0, 10)}...
                                  </span>
                                  <button
                                    onClick={() => handleResetDevice(merchant.id)}
                                    className="p-1 rounded text-[#86868B] hover:text-[#FF9500] hover:bg-[#FF9500]/10 transition"
                                    title="Desvincular celular (Reset Device ID para que use otro equipo)"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono bg-[#F5F5F7] text-[#86868B]">
                                  <Unlock className="w-3 h-3 mr-1" /> Libre para ingresar
                                </span>
                              )}
                            </td>

                            {/* Estado */}
                            <td className="py-4 px-5">
                              {merchant.status === "ACTIVE" ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#34C759]/15 text-[#248A3D]">
                                  Activo
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-black/[0.08] text-[#6E6E73]">
                                  Suspendido
                                </span>
                              )}
                            </td>

                            {/* Acciones */}
                            <td className="py-4 px-5 text-right">
                              <div className="flex items-center justify-end space-x-1.5">
                                {/* Botón Copiar Mensaje para WhatsApp */}
                                <button
                                  onClick={() => {
                                    const msg = `¡Hola! Bienvenido a Punk Cobros.\nAquí tienes tus credenciales para tu app:\n\n📱 Aplicación: Punk Cobros (Android)\n🏢 Negocio: ${merchant.businessName}\n📧 Correo: ${merchant.email}\n🔑 Contraseña: ${merchant.passwordHash}\n💰 Pago: Único de S/. 10.00 (Licencia Vitalicia de por vida, sin renovaciones)\n\nDescarga el APK oficial aquí:\nhttps://github.com/Alexander-Manosalva-Peralta/parlante-cobros-app/releases/download/v1.0.8/app-debug.apk\n\n(Tu cuenta se vinculará de forma segura a tu primer teléfono celular).`;
                                    copyToClipboard(msg, `full-${merchant.id}`);
                                  }}
                                  className="p-1.5 rounded-lg bg-[#F5F5F7] hover:bg-[#E5E5EA] text-[#6E6E73] hover:text-[#1D1D1F] transition"
                                  title="Copiar texto para WhatsApp"
                                >
                                  {copiedId === `full-${merchant.id}` ? (
                                    <Check className="w-3.5 h-3.5 text-[#34C759]" />
                                  ) : (
                                    <Send className="w-3.5 h-3.5" />
                                  )}
                                </button>

                                {/* Suspender / Activar */}
                                <button
                                  onClick={() => handleToggleStatus(merchant)}
                                  className={`p-1.5 rounded-lg transition ${
                                    merchant.status === "ACTIVE"
                                      ? "bg-[#FF9500]/10 hover:bg-[#FF9500]/20 text-[#FF9500]"
                                      : "bg-[#34C759]/10 hover:bg-[#34C759]/20 text-[#34C759]"
                                  }`}
                                  title={merchant.status === "ACTIVE" ? "Suspender acceso" : "Reactivar acceso"}
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                </button>

                                {/* Eliminar */}
                                <button
                                  onClick={() => handleDeleteMerchant(merchant.id)}
                                  className="p-1.5 rounded-lg bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 text-[#FF3B30] transition"
                                  title="Eliminar comercio definitivamente"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PESTAÑA 2: REGISTRAR COMERCIO & WHATSAPP (SIN MODAL FLOTANTE) */}
        {/* ========================================================= */}
        {activeTab === "create" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">
                Registrar Nuevo Comercio (S/. 10.00 Pago Único)
              </h2>
              <p className="text-sm text-[#86868B] mt-1">
                Genera las credenciales de acceso para tu cliente con licencia vitalicia y copia su mensaje de WhatsApp.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Formulario Estilo Apple Settings */}
              <div className="bg-white rounded-2xl p-7 border border-black/[0.06] shadow-sm space-y-5">
                <div className="flex items-center space-x-2.5 pb-3 border-b border-black/[0.04]">
                  <Building2 className="w-5 h-5 text-[#0071E3]" />
                  <h3 className="text-base font-semibold text-[#1D1D1F]">
                    Datos de la Licencia
                  </h3>
                </div>

                {createError && (
                  <div className="p-3.5 rounded-xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 flex items-center space-x-2 text-xs text-[#D70015]">
                    <AlertCircle className="w-4 h-4 text-[#FF3B30]" />
                    <span>{createError}</span>
                  </div>
                )}

                <form onSubmit={handleCreateMerchant} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#6E6E73] uppercase tracking-wider mb-1.5">
                      Nombre del Negocio o Comercio
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Bodega San José"
                      value={formBusinessName}
                      onChange={(e) => setFormBusinessName(e.target.value)}
                      className="w-full bg-[#F5F5F7] border border-black/[0.06] rounded-xl px-4 py-2.5 text-xs text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#6E6E73] uppercase tracking-wider mb-1.5">
                      Correo Electrónico (Inicio de Sesión)
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="cliente@gmail.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full bg-[#F5F5F7] border border-black/[0.06] rounded-xl px-4 py-2.5 text-xs text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-[#6E6E73] uppercase tracking-wider">
                        Contraseña Asignada
                      </label>
                      <button
                        type="button"
                        onClick={generateRandomPassword}
                        className="text-[11px] text-[#0071E3] hover:underline flex items-center space-x-1 font-medium"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Autogenerar contraseña</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      className="w-full bg-[#F5F5F7] border border-black/[0.06] rounded-xl px-4 py-2.5 text-xs font-mono text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition"
                    />
                  </div>

                  {/* Tarjeta de Modalidad de Pago Fija */}
                  <div className="p-4 bg-[#F5F5F7] rounded-xl border border-black/[0.04] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#1D1D1F]">
                        Modalidad: Pago Único Vitalicio
                      </span>
                      <span className="text-xs font-bold text-[#34C759]">S/. 10.00</span>
                    </div>
                    <p className="text-[11px] text-[#86868B]">
                      Acceso permanente de por vida. Sin suscripciones ni renovaciones mensuales.
                    </p>
                  </div>

                  <div className="pt-3 flex items-center space-x-3">
                    <button
                      type="submit"
                      disabled={creating}
                      className="flex-1 py-3 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold shadow-sm transition active:scale-95 disabled:opacity-50"
                    >
                      {creating ? "Guardando en Sistema..." : "Guardar & Emitir Licencia (S/. 10)"}
                    </button>
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="px-4 py-3 rounded-xl border border-black/[0.08] text-[#6E6E73] hover:text-[#1D1D1F] text-xs font-medium transition"
                    >
                      Limpiar
                    </button>
                  </div>
                </form>
              </div>

              {/* Vista Previa del Mensaje para WhatsApp en la misma pantalla */}
              <div className="bg-white rounded-2xl p-7 border border-black/[0.06] shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.04]">
                  <div className="flex items-center space-x-2">
                    <Send className="w-4 h-4 text-[#34C759]" />
                    <h3 className="text-base font-semibold text-[#1D1D1F]">
                      Mensaje Listo para WhatsApp
                    </h3>
                  </div>
                  <span className="text-[11px] text-[#86868B]">Vista previa en vivo</span>
                </div>

                <p className="text-xs text-[#6E6E73]">
                  Se actualiza en tiempo real mientras escribes a la izquierda. Cópialo y envíaselo por chat a tu cliente:
                </p>

                {/* Caja de Texto Estilo Apple Preview */}
                <div className="bg-[#F5F5F7] border border-black/[0.04] rounded-xl p-4 font-mono text-xs text-[#1D1D1F] whitespace-pre-wrap select-all leading-relaxed">
{`¡Hola! Bienvenido a Punk Cobros.
Aquí tienes tus credenciales de acceso para tu app de cobros y parlante de voz:

📱 Aplicación: Punk Cobros (Android)
🏢 Negocio: ${formBusinessName || "[Nombre del Negocio]"}
📧 Correo de acceso: ${formEmail || "[correo@gmail.com]"}
🔑 Contraseña: ${formPassword || "[clave]"}
💰 Pago: Único de S/. 10.00 (Licencia Vitalicia de por vida, sin renovaciones)

Descarga tu APK oficial aquí:
https://github.com/Alexander-Manosalva-Peralta/parlante-cobros-app/releases/download/v1.0.8/app-debug.apk

(Nota de seguridad: Tu cuenta quedará vinculada automáticamente a tu teléfono celular).`}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      const msg = `¡Hola! Bienvenido a Punk Cobros.\nAquí tienes tus credenciales de acceso para tu app de cobros y parlante de voz:\n\n📱 Aplicación: Punk Cobros (Android)\n🏢 Negocio: ${formBusinessName || "Tu Negocio"}\n📧 Correo de acceso: ${formEmail || "tu_correo@gmail.com"}\n🔑 Contraseña: ${formPassword || "clave"}\n💰 Pago: Único de S/. 10.00 (Licencia Vitalicia de por vida, sin renovaciones)\n\nDescarga tu APK oficial aquí:\nhttps://github.com/Alexander-Manosalva-Peralta/parlante-cobros-app/releases/download/v1.0.8/app-debug.apk\n\n(Nota de seguridad: Tu cuenta quedará vinculada automáticamente a tu teléfono celular).`;
                      copyToClipboard(msg, "tab-copy-live");
                    }}
                    className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-[#34C759] hover:bg-[#30B753] text-white font-semibold text-xs transition shadow-sm active:scale-95"
                  >
                    {copiedId === "tab-copy-live" ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>¡Mensaje Copiado al Portapapeles!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar Mensaje para Enviar por WhatsApp</span>
                      </>
                    )}
                  </button>
                </div>

                {createdSuccess && (
                  <div className="mt-4 p-3.5 rounded-xl bg-[#34C759]/10 border border-[#34C759]/20 flex items-center justify-between text-xs text-[#248A3D] font-medium">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
                      <span>¡Comercio {createdSuccess.businessName} registrado con éxito!</span>
                    </div>
                    <button
                      onClick={() => setActiveTab("merchants")}
                      className="text-[#0071E3] hover:underline font-semibold"
                    >
                      Ver en la tabla &rarr;
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PESTAÑA 3: MÉTRICAS & BUSINESS INTELLIGENCE (BI) */}
        {/* ========================================================= */}
        {activeTab === "bi" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">
                Business Intelligence & Recaudación
              </h2>
              <p className="text-sm text-[#86868B] mt-1">
                Monitoreo de ingresos por ventas de licencias vitalicias a S/. 10.00 y efectividad de cobro.
              </p>
            </div>

            {/* TARJETAS DE KPIS PRINCIPALES (APPLE WHITE CARDS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* KPI 1: Recaudación Total por Pagos Únicos */}
              <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider">
                    Recaudación Total
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#0071E3]/10 flex items-center justify-center text-[#0071E3]">
                    <CreditCard className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-[#1D1D1F] tracking-tight">
                    S/. {biStats ? biStats.totalRevenue.toFixed(2) : (merchants.length * 10).toFixed(2)}
                  </span>
                  <p className="text-xs text-[#6E6E73] mt-1.5 flex items-center space-x-1">
                    <TrendingUp className="w-3.5 h-3.5 text-[#34C759]" />
                    <span>{merchants.length} licencias vitalicias vendidas</span>
                  </p>
                </div>
              </div>

              {/* KPI 2: Licencias Vitalicias Activas */}
              <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider">
                    Comercios Activos
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#34C759]/10 flex items-center justify-center text-[#34C759]">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-[#1D1D1F] tracking-tight">
                    {merchants.filter((m) => m.status === "ACTIVE").length}
                  </span>
                  <p className="text-xs text-[#6E6E73] mt-1.5">
                    100% con acceso de por vida
                  </p>
                </div>
              </div>

              {/* KPI 3: Dispositivos Celulares Vinculados */}
              <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider">
                    Equipos Asegurados
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#AF52DE]/10 flex items-center justify-center text-[#AF52DE]">
                    <Smartphone className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-[#1D1D1F] tracking-tight">
                    {merchants.filter((m) => m.boundDeviceId).length}
                  </span>
                  <p className="text-xs text-[#6E6E73] mt-1.5 flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#AF52DE]" />
                    <span>Protección anti-piratería activa</span>
                  </p>
                </div>
              </div>

              {/* KPI 4: Precio Fijo Promedio */}
              <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider">
                    Precio por Licencia
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#34C759]/10 flex items-center justify-center text-[#34C759]">
                    <Infinity className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-[#1D1D1F] tracking-tight">
                    S/. 10.00
                  </span>
                  <p className="text-xs text-[#6E6E73] mt-1.5">
                    Pago único de por vida (sin cobro mensual)
                  </p>
                </div>
              </div>
            </div>

            {/* GRÁFICOS APPLE: LIMPIOS Y CLAROS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-black/[0.06] shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-[#1D1D1F]">
                    Modelo Comercial Punk
                  </h3>
                  <p className="text-xs text-[#86868B] mt-0.5">
                    Estructura de cobro único para comercios peruanos (Yape, Plin y BCP)
                  </p>
                </div>

                <div className="p-5 bg-[#F5F5F7] rounded-xl border border-black/[0.04] space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-[#1D1D1F]">
                      Licencia Vitalicia de por vida
                    </span>
                    <span className="font-bold text-[#0071E3]">S/. 10.00 único</span>
                  </div>
                  <div className="h-2.5 w-full bg-[#E5E5EA] rounded-full overflow-hidden">
                    <div className="h-full bg-[#0071E3] rounded-full w-full" />
                  </div>
                  <p className="text-[11px] text-[#6E6E73]">
                    El cliente paga S/. 10 una sola vez y tiene el parlante de cobros de por vida en su celular. La cuenta se bloquea a su equipo móvil para impedir que la revenda o comparta.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-semibold text-[#1D1D1F]">Salud del Ecosistema</h3>
                  <p className="text-xs text-[#86868B] mt-0.5">Disponibilidad de las apps de cobro</p>
                </div>

                <div className="flex flex-col items-center justify-center my-6">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-[#E5E5EA]"
                        strokeWidth="3.2"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#34C759]"
                        strokeDasharray="100, 100"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-2xl font-bold text-[#1D1D1F] tracking-tight">100%</span>
                      <span className="text-[10px] uppercase font-semibold text-[#86868B]">Actividad</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#F5F5F7] rounded-xl p-3 text-center text-xs text-[#6E6E73]">
                  Altavoz POS y detección de pagos operando al 100%.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PESTAÑA 4: BASE DE DATOS & SUPABASE */}
        {/* ========================================================= */}
        {activeTab === "database" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">
                Conexión & Base de Datos (Supabase)
              </h2>
              <p className="text-sm text-[#86868B] mt-1">
                Estado de la base de datos PostgreSQL en Supabase y endpoints de la API.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-sm space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b border-black/[0.04]">
                  <Database className="w-4 h-4 text-[#0071E3]" />
                  <h3 className="text-sm font-semibold text-[#1D1D1F]">
                    Endpoints Activos en Vercel
                  </h3>
                </div>

                <div className="space-y-3 text-xs text-[#6E6E73] leading-relaxed">
                  <div className="p-3 bg-[#F5F5F7] rounded-xl border border-black/[0.04]">
                    <span className="font-semibold text-[#1D1D1F] block mb-1">
                      POST /api/licenses/validate
                    </span>
                    Consumido por la app móvil Android Punk para verificar credenciales y bloquear el equipo.
                  </div>

                  <div className="p-3 bg-[#F5F5F7] rounded-xl border border-black/[0.04]">
                    <span className="font-semibold text-[#1D1D1F] block mb-1">
                      GET / POST / PATCH / DELETE /api/merchants
                    </span>
                    CRUD de comercios para el panel web de administración.
                  </div>

                  <div className="p-3 bg-[#F5F5F7] rounded-xl border border-black/[0.04]">
                    <span className="font-semibold text-[#1D1D1F] block mb-1">
                      GET /api/bi/stats
                    </span>
                    Métricas de recaudación por licencias de S/. 10.00.
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-black/[0.04]">
                  <h3 className="text-sm font-semibold text-[#1D1D1F]">
                    Script SQL para Supabase
                  </h3>
                  <button
                    onClick={() => {
                      const sql = `-- Tabla de Comercios y Licencias de S/. 10 Pago Único
CREATE TABLE IF NOT EXISTS public.merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    plan_name VARCHAR(100) DEFAULT 'Pago Único Vitalicio (De por vida)',
    days_duration INT DEFAULT 36500,
    price_soles DECIMAL(10, 2) DEFAULT 10.00,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    bound_device_id VARCHAR(255) DEFAULT NULL,
    first_login_at TIMESTAMPTZ DEFAULT NULL,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '100 years'),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon API Access" ON public.merchants FOR ALL USING (true) WITH CHECK (true);`;
                      copyToClipboard(sql, "sql-copy");
                    }}
                    className="text-xs text-[#0071E3] hover:underline font-medium flex items-center space-x-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedId === "sql-copy" ? "¡Copiado!" : "Copiar SQL"}</span>
                  </button>
                </div>

                <div className="bg-[#1D1D1F] text-gray-200 rounded-xl p-3.5 font-mono text-[11px] overflow-x-auto leading-relaxed max-h-48">
{`CREATE TABLE public.merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  plan_name VARCHAR(100) DEFAULT 'Pago Único Vitalicio',
  price_soles DECIMAL(10, 2) DEFAULT 10.00,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  bound_device_id VARCHAR(255) DEFAULT NULL
);`}
                </div>

                <div className="p-3 bg-[#F5F5F7] rounded-xl text-xs text-[#6E6E73]">
                  URL de tu proyecto Supabase: <strong>https://uavilbyvctfydqvkfzjg.supabase.co</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
