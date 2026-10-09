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
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Lock,
  Unlock,
  Trash2,
  Calendar,
  Building2,
  RefreshCw,
  Send,
  Eye,
  EyeOff,
  BarChart3,
  PieChart,
  HelpCircle,
  Check,
  SlidersHorizontal,
  Layers,
  Database,
  ArrowRight
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
  planBreakdown: {
    monthly: number;
    quarterly: number;
    annual: number;
  };
}

type TabType = "bi" | "merchants" | "create" | "database";

export default function AppleAdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("bi");
  const [merchants, setMerchants] = useState<MerchantItem[]>([]);
  const [biStats, setBiStats] = useState<BiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [visiblePasswords, setVisiblePasswords] = useState<{ [id: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State para Nuevo Comercio (Pestaña Dedicada)
  const [formBusinessName, setFormBusinessName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formPlan, setFormPlan] = useState("30");
  const [formPhone, setFormPhone] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdSuccess, setCreatedSuccess] = useState<MerchantItem | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [merchantsRes, biRes] = await Promise.all([
        fetch("/api/merchants"),
        fetch("/api/bi/stats"),
      ]);
      const mData = await merchantsRes.json();
      const bData = await biRes.json();
      if (mData.merchants) setMerchants(mData.merchants);
      if (bData.metrics) setBiStats(bData.metrics);
    } catch (err) {
      console.error("Error al cargar datos:", err);
    } finally {
      setLoading(false);
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
    if (!formBusinessName || !formEmail || !formPassword) return;

    setCreating(true);
    try {
      let planName = "Pago Único - Licencia 30 Días";
      let days = 30;
      let price = 35.0;

      if (formPlan === "90") {
        planName = "Pago Único - Licencia 90 Días";
        days = 90;
        price = 95.0;
      } else if (formPlan === "180") {
        planName = "Pago Único - Licencia 180 Días";
        days = 180;
        price = 175.0;
      } else if (formPlan === "365") {
        planName = "Pago Único - Licencia 365 Días";
        days = 365;
        price = 320.0;
      }

      const res = await fetch("/api/merchants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: formBusinessName,
          email: formEmail,
          passwordHash: formPassword,
          planName,
          daysDuration: days,
          priceSoles: price,
        }),
      });

      const data = await res.json();
      if (data.merchant) {
        setCreatedSuccess(data.merchant);
        fetchData();
      }
    } catch (err) {
      console.error("Error creando comercio:", err);
    } finally {
      setCreating(false);
    }
  }

  function handleResetForm() {
    setFormBusinessName("");
    setFormEmail("");
    setFormPassword("");
    setFormPhone("");
    setCreatedSuccess(null);
  }

  async function handleResetDevice(id: string) {
    if (!confirm("¿Deseas desvincular el celular actual? El comercio podrá iniciar sesión en un nuevo dispositivo.")) return;
    try {
      const res = await fetch("/api/merchants", {
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
      const res = await fetch("/api/merchants", {
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
      const res = await fetch(`/api/merchants?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  }

  function getRemainingDays(expiresAt: string) {
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  const filteredMerchants = merchants.filter((m) => {
    const matchesSearch =
      m.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.boundDeviceId && m.boundDeviceId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
      {/* CABECERA ESTILO APPLE: LIMPIA, CON ESPACIO NEGATIVO Y JERARQUÍA CLARA */}
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
              </div>
              <p className="text-xs text-[#86868B]">
                Gestión Centralizada de Licencias & Inteligencia de Negocios
              </p>
            </div>
          </div>

          {/* INDICADORES Y ACCIÓN DIRECTA */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 bg-white px-3.5 py-1.5 rounded-full border border-black/[0.06] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#34C759]"></span>
              <span className="text-xs font-medium text-[#6E6E73]">Vercel & Supabase</span>
            </div>

            <button
              onClick={fetchData}
              className="p-2 rounded-full bg-white border border-black/[0.08] hover:bg-gray-50 text-[#6E6E73] hover:text-[#1D1D1F] transition shadow-sm"
              title="Actualizar datos"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* NAVEGACIÓN POR PESTAÑAS (APPLE SEGMENTED CONTROLS) */}
        <div className="max-w-6xl mx-auto px-6 pb-4">
          <div className="inline-flex p-1 bg-[#E5E5EA]/70 rounded-xl space-x-1 border border-black/[0.04]">
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
              <span>Registrar Comercio</span>
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

      {/* CONTENIDO PRINCIPAL SEGÚN PESTAÑA */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* ========================================================= */}
        {/* PESTAÑA 1: BUSINESS INTELLIGENCE & MÉTRICAS (ESTILO APPLE) */}
        {/* ========================================================= */}
        {activeTab === "bi" && (
          <div className="space-y-8">
            {/* Título de Sección */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">
                Resumen Ejecutivo & Rendimiento
              </h2>
              <p className="text-sm text-[#86868B] mt-1">
                Análisis de cobros por pagos únicos de licencias y actividad de comercios autorizados.
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
                    S/. {biStats ? biStats.totalRevenue.toFixed(2) : "0.00"}
                  </span>
                  <p className="text-xs text-[#6E6E73] mt-1.5 flex items-center space-x-1">
                    <TrendingUp className="w-3.5 h-3.5 text-[#34C759]" />
                    <span>Pagos únicos acumulados</span>
                  </p>
                </div>
              </div>

              {/* KPI 2: Licencias Activas */}
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
                    {biStats ? biStats.activeMerchants : 0}
                  </span>
                  <p className="text-xs text-[#6E6E73] mt-1.5">
                    de {biStats ? biStats.totalMerchants : 0} comercios registrados
                  </p>
                </div>
              </div>

              {/* KPI 3: Dispositivos Asegurados */}
              <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider">
                    Equipos Vinculados
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

              {/* KPI 4: Licencias Vencidas / Por Renovar */}
              <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider">
                    Por Renovar
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#FF9500]/10 flex items-center justify-center text-[#FF9500]">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-[#1D1D1F] tracking-tight">
                    {biStats ? biStats.expiredMerchants : 0}
                  </span>
                  <p className="text-xs text-[#6E6E73] mt-1.5">
                    Oportunidad de cobro de nueva licencia
                  </p>
                </div>
              </div>
            </div>

            {/* GRÁFICOS VISUALES APPLE: LIMPIOS, CLAROS, SIN SOBRECARGA */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Gráfico 1: Desglose por Planes de Pago Único */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-black/[0.06] shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-[#1D1D1F]">
                    Distribución por Tipo de Licencia
                  </h3>
                  <p className="text-xs text-[#86868B] mt-0.5">
                    Volumen de ventas según la modalidad de pago único contratada
                  </p>
                </div>

                <div className="space-y-5">
                  {/* Barra 1: 30 Días */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[#1D1D1F]">
                        Pago Único — Licencia 30 Días (S/. 35.00)
                      </span>
                      <span className="font-bold text-[#0071E3]">
                        {biStats?.planBreakdown.monthly || 0} comercios
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-[#F5F5F7] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0071E3] rounded-full transition-all duration-500"
                        style={{
                          width: `${((biStats?.planBreakdown.monthly || 0) / Math.max(1, biStats?.totalMerchants || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Barra 2: 90 Días */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[#1D1D1F]">
                        Pago Único — Licencia 90 Días (S/. 95.00)
                      </span>
                      <span className="font-bold text-[#34C759]">
                        {biStats?.planBreakdown.quarterly || 0} comercios
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-[#F5F5F7] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#34C759] rounded-full transition-all duration-500"
                        style={{
                          width: `${((biStats?.planBreakdown.quarterly || 0) / Math.max(1, biStats?.totalMerchants || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Barra 3: 365 Días */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[#1D1D1F]">
                        Pago Único — Licencia 365 Días (S/. 320.00)
                      </span>
                      <span className="font-bold text-[#AF52DE]">
                        {biStats?.planBreakdown.annual || 0} comercios
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-[#F5F5F7] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#AF52DE] rounded-full transition-all duration-500"
                        style={{
                          width: `${((biStats?.planBreakdown.annual || 0) / Math.max(1, biStats?.totalMerchants || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between text-xs text-[#86868B]">
                  <span>Precios oficiales en Soles peruanos</span>
                  <span>Sin cobros recurrentes sorpresa</span>
                </div>
              </div>

              {/* Gráfico 2: Tasa de Comercios Activos */}
              <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-semibold text-[#1D1D1F]">Salud de la Red</h3>
                  <p className="text-xs text-[#86868B] mt-0.5">Proporción de comercios operando</p>
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
                        strokeDasharray={`${((biStats?.activeMerchants || 1) / Math.max(1, biStats?.totalMerchants || 1)) * 100}, 100`}
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-2xl font-bold text-[#1D1D1F] tracking-tight">
                        {Math.round(((biStats?.activeMerchants || 0) / Math.max(1, biStats?.totalMerchants || 1)) * 100)}%
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-[#86868B]">Activos</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#F5F5F7] rounded-xl p-3 text-center text-xs text-[#6E6E73]">
                  Parlante y notificaciones funcionando sin incidencias técnicas.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PESTAÑA 2: COMERCIOS & GESTIÓN DE LICENCIAS (ESTILO APPLE) */}
        {/* ========================================================= */}
        {activeTab === "merchants" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">
                  Comercios & Licencias
                </h2>
                <p className="text-sm text-[#86868B] mt-1">
                  Listado de clientes autorizados, control de acceso y vinculación de equipos.
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
                <span>Nuevo Comercio</span>
              </button>
            </div>

            {/* BARRA DE FILTROS Y BÚSQUEDA APPLE */}
            <div className="bg-white rounded-2xl p-4 border border-black/[0.06] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative flex-1 w-full max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868B]" />
                <input
                  type="text"
                  placeholder="Buscar por negocio, correo o ID de celular..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#F5F5F7] border border-black/[0.06] rounded-xl pl-10 pr-4 py-2 text-xs text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition"
                />
              </div>

              <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                {["ALL", "ACTIVE", "EXPIRED", "SUSPENDED"].map((st) => (
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
                    {st === "ACTIVE" && "Activos"}
                    {st === "EXPIRED" && "Vencidos"}
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
                      <th className="py-4 px-5">Plan de Pago Único</th>
                      <th className="py-4 px-5">Celular Vinculado</th>
                      <th className="py-4 px-5">Estado</th>
                      <th className="py-4 px-5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04]">
                    {filteredMerchants.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-[#86868B]">
                          No se encontraron comercios registrados en esta categoría.
                        </td>
                      </tr>
                    ) : (
                      filteredMerchants.map((merchant) => {
                        const daysLeft = getRemainingDays(merchant.expiresAt);
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

                            {/* Plan de Pago Único */}
                            <td className="py-4 px-5">
                              <div className="font-medium text-[#1D1D1F]">{merchant.planName}</div>
                              <div className="text-[11px] text-[#86868B] mt-0.5">
                                {merchant.status === "EXPIRED" ? (
                                  <span className="text-[#FF3B30] font-semibold">Expirado</span>
                                ) : (
                                  <span className={daysLeft <= 5 ? "text-[#FF9500] font-semibold" : "text-[#34C759]"}>
                                    {daysLeft} días restantes
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Dispositivo Vinculado */}
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
                                    title="Desvincular celular (Reset Device ID)"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono bg-[#F5F5F7] text-[#86868B]">
                                  <Unlock className="w-3 h-3 mr-1" /> Libre
                                </span>
                              )}
                            </td>

                            {/* Estado */}
                            <td className="py-4 px-5">
                              {merchant.status === "ACTIVE" && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#34C759]/15 text-[#248A3D]">
                                  Activo
                                </span>
                              )}
                              {merchant.status === "EXPIRED" && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FF3B30]/15 text-[#D70015]">
                                  Vencido
                                </span>
                              )}
                              {merchant.status === "SUSPENDED" && (
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
                                    const msg = `¡Hola! Bienvenido a Punk Cobros.\nAquí tienes tus credenciales para tu app:\n\n📱 Aplicación: Punk Cobros\n🏢 Negocio: ${merchant.businessName}\n📧 Correo: ${merchant.email}\n🔑 Contraseña: ${merchant.passwordHash}\n⏳ Plan contratado: ${merchant.planName}\n\nDescarga el APK oficial aquí:\nhttps://github.com/Alexander-Manosalva-Peralta/parlante-cobros-app/releases/download/v1.0.8/app-debug.apk\n\n(Tu cuenta se vinculará de forma segura a tu primer teléfono celular).`;
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
                                  title={merchant.status === "ACTIVE" ? "Suspender cuenta" : "Reactivar cuenta"}
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                </button>

                                {/* Eliminar */}
                                <button
                                  onClick={() => handleDeleteMerchant(merchant.id)}
                                  className="p-1.5 rounded-lg bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 text-[#FF3B30] transition"
                                  title="Eliminar comercio"
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
        {/* PESTAÑA 3: REGISTRAR COMERCIO & MENSAJE WHATSAPP (SIN MODAL FLOTANTE) */}
        {/* ========================================================= */}
        {activeTab === "create" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">
                Registrar Nuevo Comercio
              </h2>
              <p className="text-sm text-[#86868B] mt-1">
                Genera credenciales de acceso para un nuevo cliente y prepara su mensaje de bienvenida para WhatsApp.
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
                      Correo Electrónico del Cliente
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="ejemplo@gmail.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full bg-[#F5F5F7] border border-black/[0.06] rounded-xl px-4 py-2.5 text-xs text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-[#6E6E73] uppercase tracking-wider">
                        Contraseña de Acceso
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

                  <div>
                    <label className="block text-xs font-semibold text-[#6E6E73] uppercase tracking-wider mb-1.5">
                      Modalidad de Pago Único & Duración
                    </label>
                    <select
                      value={formPlan}
                      onChange={(e) => setFormPlan(e.target.value)}
                      className="w-full bg-[#F5F5F7] border border-black/[0.06] rounded-xl px-4 py-2.5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition"
                    >
                      <option value="30">Pago Único — Licencia 30 Días (S/. 35.00)</option>
                      <option value="90">Pago Único — Licencia 90 Días (S/. 95.00)</option>
                      <option value="180">Pago Único — Licencia 180 Días (S/. 175.00)</option>
                      <option value="365">Pago Único — Licencia 365 Días (S/. 320.00)</option>
                    </select>
                  </div>

                  <div className="pt-3 flex items-center space-x-3">
                    <button
                      type="submit"
                      disabled={creating}
                      className="flex-1 py-3 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold shadow-sm transition active:scale-95 disabled:opacity-50"
                    >
                      {creating ? "Guardando..." : "Guardar & Generar Credenciales"}
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

              {/* Vista Previa del Mensaje para WhatsApp Integrada (En la misma pantalla) */}
              <div className="bg-white rounded-2xl p-7 border border-black/[0.06] shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.04]">
                  <div className="flex items-center space-x-2">
                    <Send className="w-4 h-4 text-[#34C759]" />
                    <h3 className="text-base font-semibold text-[#1D1D1F]">
                      Mensaje de WhatsApp para el Cliente
                    </h3>
                  </div>
                  <span className="text-[11px] text-[#86868B]">Vista previa en vivo</span>
                </div>

                <p className="text-xs text-[#6E6E73]">
                  Este texto se genera automáticamente con los datos que ingreses a la izquierda. Puedes copiarlo y pegarlo directamente en el chat de WhatsApp de tu cliente:
                </p>

                {/* Caja de Texto Estilo Apple Preview */}
                <div className="bg-[#F5F5F7] border border-black/[0.04] rounded-xl p-4 font-mono text-xs text-[#1D1D1F] whitespace-pre-wrap select-all leading-relaxed">
{`¡Hola! Bienvenido a Punk Cobros.
Aquí tienes tus credenciales de acceso para tu app de cobros y parlante de voz:

📱 Aplicación: Punk Cobros (Android)
🏢 Negocio: ${formBusinessName || "[Nombre del Negocio]"}
📧 Correo de acceso: ${formEmail || "[correo@gmail.com]"}
🔑 Contraseña: ${formPassword || "[clave]"}
⏳ Modalidad: Pago Único (${formPlan} días de vigencia)

Descarga tu APK oficial aquí:
https://github.com/Alexander-Manosalva-Peralta/parlante-cobros-app/releases/download/v1.0.8/app-debug.apk

(Nota: Tu cuenta se vinculará automáticamente a tu primer teléfono celular).`}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      const msg = `¡Hola! Bienvenido a Punk Cobros.\nAquí tienes tus credenciales de acceso para tu app de cobros y parlante de voz:\n\n📱 Aplicación: Punk Cobros (Android)\n🏢 Negocio: ${formBusinessName || "Tu Negocio"}\n📧 Correo de acceso: ${formEmail || "tu_correo@gmail.com"}\n🔑 Contraseña: ${formPassword || "clave"}\n⏳ Modalidad: Pago Único (${formPlan} días de vigencia)\n\nDescarga tu APK oficial aquí:\nhttps://github.com/Alexander-Manosalva-Peralta/parlante-cobros-app/releases/download/v1.0.8/app-debug.apk\n\n(Nota: Tu cuenta se vinculará automáticamente a tu primer teléfono celular).`;
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
                  <div className="mt-4 p-3.5 rounded-xl bg-[#34C759]/10 border border-[#34C759]/20 flex items-center space-x-2 text-xs text-[#248A3D] font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
                    <span>¡Comercio {createdSuccess.businessName} guardado con éxito en el sistema!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PESTAÑA 4: BASE DE DATOS SUPABASE & GUÍA DE CONFIGURACIÓN */}
        {/* ========================================================= */}
        {activeTab === "database" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">
                Conexión & Base de Datos (Supabase)
              </h2>
              <p className="text-sm text-[#86868B] mt-1">
                Guía rápida de integración de PostgreSQL en Supabase con Next.js y Vercel.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tarjeta de Instrucciones para la pantalla de Supabase */}
              <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-sm space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b border-black/[0.04]">
                  <Database className="w-4 h-4 text-[#0071E3]" />
                  <h3 className="text-sm font-semibold text-[#1D1D1F]">
                    Cómo Completar la Pantalla de Creación de Supabase
                  </h3>
                </div>

                <div className="space-y-3 text-xs text-[#6E6E73] leading-relaxed">
                  <div className="p-3 bg-[#F5F5F7] rounded-xl border border-black/[0.04]">
                    <span className="font-semibold text-[#1D1D1F] block mb-1">1. Database password:</span>
                    Haz clic en el enlace azul <strong>Generate a password</strong> y copia la contraseña generada en tu bloc de notas.
                  </div>

                  <div className="p-3 bg-[#F5F5F7] rounded-xl border border-black/[0.04]">
                    <span className="font-semibold text-[#1D1D1F] block mb-1">2. Region:</span>
                    Selecciona <strong>Americas (São Paulo, Brazil)</strong> o <strong>Americas (East US - North Virginia)</strong> para tener la menor latencia posible en Perú y Latinoamérica.
                  </div>

                  <div className="p-3 bg-[#F5F5F7] rounded-xl border border-black/[0.04]">
                    <span className="font-semibold text-[#1D1D1F] block mb-1">3. Security Checkboxes:</span>
                    Deja marcadas las casillas <strong>Enable Data API</strong> y <strong>Automatically expose new tables</strong> tal como están en tu captura de pantalla.
                  </div>

                  <div className="p-3 bg-[#F5F5F7] rounded-xl border border-black/[0.04]">
                    <span className="font-semibold text-[#1D1D1F] block mb-1">4. Crear el Proyecto:</span>
                    Haz clic en el botón inferior <strong>Create new project</strong> y espera aproximadamente 1 minuto mientras se provisiona.
                  </div>
                </div>
              </div>

              {/* Tarjeta de Script SQL Listo para Ejecutar */}
              <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-black/[0.04]">
                  <h3 className="text-sm font-semibold text-[#1D1D1F]">
                    Script SQL para Crear las Tablas
                  </h3>
                  <button
                    onClick={() => {
                      const sql = `-- PUNK SUPABASE DATABASE SCHEMA
CREATE TABLE IF NOT EXISTS public.merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    plan_name VARCHAR(100) DEFAULT 'Pago Único - Licencia 30 Días',
    days_duration INT DEFAULT 30,
    price_soles DECIMAL(10, 2) DEFAULT 35.00,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    bound_device_id VARCHAR(255) DEFAULT NULL,
    first_login_at TIMESTAMPTZ DEFAULT NULL,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon Full Access" ON public.merchants FOR ALL USING (true) WITH CHECK (true);`;
                      copyToClipboard(sql, "sql-copy");
                    }}
                    className="text-xs text-[#0071E3] hover:underline font-medium flex items-center space-x-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedId === "sql-copy" ? "¡Copiado!" : "Copiar SQL"}</span>
                  </button>
                </div>

                <p className="text-xs text-[#6E6E73]">
                  En tu panel de Supabase, ve a la pestaña <strong>SQL Editor</strong> en el menú lateral izquierdo, pega este código y haz clic en <strong>RUN</strong>:
                </p>

                <div className="bg-[#1D1D1F] text-gray-200 rounded-xl p-3.5 font-mono text-[11px] overflow-x-auto leading-relaxed max-h-48">
{`CREATE TABLE public.merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  plan_name VARCHAR(100) DEFAULT 'Pago Único - Licencia 30 Días',
  days_duration INT DEFAULT 30,
  price_soles DECIMAL(10, 2) DEFAULT 35.00,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  bound_device_id VARCHAR(255) DEFAULT NULL,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);`}
                </div>

                <div className="p-3 bg-[#F5F5F7] rounded-xl text-xs text-[#6E6E73]">
                  Luego en <strong>Project Settings &gt; API</strong>, copia tu <strong>Project URL</strong> y tu <strong>anon public key</strong> para agregarlas en Vercel.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
