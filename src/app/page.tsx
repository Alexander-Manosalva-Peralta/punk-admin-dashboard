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
  Check
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

export default function AdminDashboard() {
  const [merchants, setMerchants] = useState<MerchantItem[]>([]);
  const [biStats, setBiStats] = useState<BiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [showModal, setShowModal] = useState(false);
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [newMerchantData, setNewMerchantData] = useState<MerchantItem | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<{ [id: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State para Nuevo Comercio
  const [formBusinessName, setFormBusinessName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formPlan, setFormPlan] = useState("30");
  const [formPhone, setFormPhone] = useState("");
  const [creating, setCreating] = useState(false);

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
      let planName = "Plan Pro 30 Días";
      let days = 30;
      let price = 35.0;

      if (formPlan === "90") {
        planName = "Plan Trimestral 90 Días";
        days = 90;
        price = 95.0;
      } else if (formPlan === "180") {
        planName = "Plan Semestral 180 Días";
        days = 180;
        price = 175.0;
      } else if (formPlan === "365") {
        planName = "Plan Anual 365 Días";
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
        setNewMerchantData(data.merchant);
        setShowModal(false);
        setShowWhatsappModal(true);
        // Reset form
        setFormBusinessName("");
        setFormEmail("");
        setFormPassword("");
        fetchData();
      }
    } catch (err) {
      console.error("Error creando comercio:", err);
    } finally {
      setCreating(false);
    }
  }

  async function handleResetDevice(id: string) {
    if (!confirm("¿Seguro que deseas desvincular el dispositivo celular de este comercio? Podrá iniciar sesión en un nuevo equipo.")) return;
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
    if (!confirm("¿Seguro que deseas eliminar definitivamente este comercio del sistema?")) return;
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
    <div className="min-h-screen bg-[#07090D] text-gray-200">
      {/* HEADER SUPERIOR */}
      <header className="sticky top-0 z-30 border-b border-[#1E2533] bg-[#0C1017]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-[#2D3748] shadow-lg shadow-emerald-500/10">
              <Image
                src="/logo_p_solo.png"
                alt="Punk Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white">Punk</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Control & BI
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Sistema Centralizado de Licencias & Protección Anti-Piratería
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 bg-[#121824] px-3 py-1.5 rounded-lg border border-[#20293A]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs text-gray-300 font-medium">Supabase / PostgreSQL Conectado</span>
            </div>

            <button
              onClick={() => {
                generateRandomPassword();
                setShowModal(true);
              }}
              className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-semibold px-4 py-2.5 rounded-xl transition duration-150 shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nuevo Comercio</span>
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* SECCIÓN 1: BUSINESS INTELLIGENCE (BI) KPIS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">Business Intelligence & Métricas</h2>
            </div>
            <span className="text-xs text-gray-400">Actualización en tiempo real</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Ingresos Recaudados */}
            <div className="bg-[#0F141F] border border-[#1E2638] rounded-2xl p-5 hover:border-emerald-500/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recaudación Bruta</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-extrabold text-white">
                  S/. {biStats ? biStats.totalRevenue.toFixed(2) : "0.00"}
                </span>
                <div className="flex items-center space-x-1.5 mt-1 text-xs text-emerald-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>S/. {biStats ? biStats.activeRevenue.toFixed(2) : "0.00"} en planes activos</span>
                </div>
              </div>
            </div>

            {/* KPI 2: Comercios Activos */}
            <div className="bg-[#0F141F] border border-[#1E2638] rounded-2xl p-5 hover:border-emerald-500/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Comercios Activos</span>
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-extrabold text-white">
                  {biStats ? biStats.activeMerchants : 0}
                </span>
                <div className="flex items-center space-x-1 mt-1 text-xs text-gray-400">
                  <span>de {biStats ? biStats.totalMerchants : 0} registrados en total</span>
                </div>
              </div>
            </div>

            {/* KPI 3: Dispositivos Vinculados (Hardware Lock) */}
            <div className="bg-[#0F141F] border border-[#1E2638] rounded-2xl p-5 hover:border-emerald-500/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Dispositivos Bloqueados</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Smartphone className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-extrabold text-white">
                  {merchants.filter((m) => m.boundDeviceId).length}
                </span>
                <div className="flex items-center space-x-1 mt-1 text-xs text-indigo-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Protección anti-piratería activa</span>
                </div>
              </div>
            </div>

            {/* KPI 4: Licencias Vencidas / Por Renovar */}
            <div className="bg-[#0F141F] border border-[#1E2638] rounded-2xl p-5 hover:border-amber-500/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Por Renovar / Vencidos</span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-extrabold text-white">
                  {biStats ? biStats.expiredMerchants : 0}
                </span>
                <div className="flex items-center space-x-1 mt-1 text-xs text-amber-400">
                  <span>Oportunidades de re-cobro</span>
                </div>
              </div>
            </div>
          </div>

          {/* GRÁFICOS VISUALES DE DISTRIBUCIÓN BI */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
            {/* Gráfico 1: Desglose por Planes */}
            <div className="lg:col-span-2 bg-[#0F141F] border border-[#1E2638] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
                <div className="flex items-center space-x-2">
                  <PieChart className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Distribución de Planes & Retención</h3>
                </div>
                <span className="text-xs text-gray-400">Métricas de adopción</span>
              </div>

              <div className="space-y-4">
                {/* Barra Mensual */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-300 font-medium">Plan Pro 30 Días (S/. 35.00)</span>
                    <span className="text-emerald-400 font-bold">
                      {biStats?.planBreakdown.monthly || 0} comercios
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#182030] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${((biStats?.planBreakdown.monthly || 0) / Math.max(1, biStats?.totalMerchants || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Barra Trimestral */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-300 font-medium">Plan Trimestral 90 Días (S/. 95.00)</span>
                    <span className="text-cyan-400 font-bold">
                      {biStats?.planBreakdown.quarterly || 0} comercios
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#182030] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                      style={{
                        width: `${((biStats?.planBreakdown.quarterly || 0) / Math.max(1, biStats?.totalMerchants || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Barra Anual */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-300 font-medium">Plan Anual 365 Días (S/. 320.00)</span>
                    <span className="text-indigo-400 font-bold">
                      {biStats?.planBreakdown.annual || 0} comercios
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#182030] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${((biStats?.planBreakdown.annual || 0) / Math.max(1, biStats?.totalMerchants || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico 2: Salud del Ecosistema */}
            <div className="bg-[#0F141F] border border-[#1E2638] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
                <h3 className="text-sm font-bold text-white">Salud del Ecosistema</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>

              <div className="flex flex-col justify-center items-center py-4 space-y-3">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#182030]"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-500"
                      strokeDasharray={`${((biStats?.activeMerchants || 1) / Math.max(1, biStats?.totalMerchants || 1)) * 100}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-xl font-bold text-white">
                      {Math.round(((biStats?.activeMerchants || 0) / Math.max(1, biStats?.totalMerchants || 1)) * 100)}%
                    </span>
                    <span className="text-[10px] text-gray-400">Actividad</span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-300 font-medium">Tasa de Efectividad</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Comercios usando el parlante de voz sin incidencias
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 2: TABLA DE CONTROL DE LICENCIAS & COMERCIOS */}
        <section className="bg-[#0F141F] border border-[#1E2638] rounded-2xl overflow-hidden shadow-2xl">
          {/* Barra de Filtros y Búsqueda */}
          <div className="p-5 border-b border-[#1E2638] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar por negocio, correo o ID de celular..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#141A26] border border-[#232C3D] rounded-xl pl-10 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="flex items-center space-x-2">
              {["ALL", "ACTIVE", "EXPIRED", "SUSPENDED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    statusFilter === st
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-[#141A26] text-gray-400 hover:text-gray-200 border border-[#232C3D]"
                  }`}
                >
                  {st === "ALL" && "Todos"}
                  {st === "ACTIVE" && "Activos"}
                  {st === "EXPIRED" && "Vencidos"}
                  {st === "SUSPENDED" && "Suspendidos"}
                </button>
              ))}

              <button
                onClick={fetchData}
                className="p-2 rounded-lg bg-[#141A26] border border-[#232C3D] text-gray-400 hover:text-white transition"
                title="Actualizar datos"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Tabla de Comercios */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-[#121824] text-[11px] uppercase tracking-wider text-gray-400 border-b border-[#1E2638]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Comercio</th>
                  <th className="py-3.5 px-4 font-semibold">Credenciales de Acceso</th>
                  <th className="py-3.5 px-4 font-semibold">Plan & Vigencia</th>
                  <th className="py-3.5 px-4 font-semibold">Dispositivo Vinculado</th>
                  <th className="py-3.5 px-4 font-semibold">Estado</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#182030]">
                {filteredMerchants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-500">
                      No se encontraron comercios registrados.
                    </td>
                  </tr>
                ) : (
                  filteredMerchants.map((merchant) => {
                    const daysLeft = getRemainingDays(merchant.expiresAt);
                    const isPassVisible = visiblePasswords[merchant.id];

                    return (
                      <tr key={merchant.id} className="hover:bg-[#131926] transition">
                        {/* Comercio */}
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
                              {merchant.businessName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-white">{merchant.businessName}</div>
                              <div className="text-xs text-gray-400">{merchant.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Credenciales */}
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs bg-[#151D2A] px-2.5 py-1 rounded border border-[#253043] text-gray-300">
                              {isPassVisible ? merchant.passwordHash : "••••••••"}
                            </span>
                            <button
                              onClick={() =>
                                setVisiblePasswords((prev) => ({
                                  ...prev,
                                  [merchant.id]: !prev[merchant.id],
                                }))
                              }
                              className="text-gray-400 hover:text-white"
                              title={isPassVisible ? "Ocultar" : "Mostrar"}
                            >
                              {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => copyToClipboard(merchant.passwordHash, `pass-${merchant.id}`)}
                              className="text-gray-400 hover:text-emerald-400"
                              title="Copiar contraseña"
                            >
                              {copiedId === `pass-${merchant.id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Plan & Vigencia */}
                        <td className="py-4 px-4">
                          <div className="text-xs font-medium text-gray-200">{merchant.planName}</div>
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            {merchant.status === "EXPIRED" ? (
                              <span className="text-rose-400 font-semibold">Expirado</span>
                            ) : (
                              <span className={daysLeft <= 5 ? "text-amber-400 font-semibold" : "text-emerald-400"}>
                                {daysLeft} días restantes
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Dispositivo Vinculado */}
                        <td className="py-4 px-4">
                          {merchant.boundDeviceId ? (
                            <div className="flex items-center space-x-1.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <Lock className="w-3 h-3 mr-1" />
                                {merchant.boundDeviceId.slice(0, 12)}...
                              </span>
                              <button
                                onClick={() => handleResetDevice(merchant.id)}
                                className="p-1 rounded text-gray-400 hover:text-amber-400 hover:bg-amber-400/10"
                                title="Desvincular celular (Reset Device ID)"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono bg-gray-800 text-gray-400 border border-gray-700">
                              <Unlock className="w-3 h-3 mr-1" /> Sin teléfono vinculado
                            </span>
                          )}
                        </td>

                        {/* Estado */}
                        <td className="py-4 px-4">
                          {merchant.status === "ACTIVE" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              Activo
                            </span>
                          )}
                          {merchant.status === "EXPIRED" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                              Vencido
                            </span>
                          )}
                          {merchant.status === "SUSPENDED" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-500/15 text-gray-400 border border-gray-500/30">
                              Suspendido
                            </span>
                          )}
                        </td>

                        {/* Acciones */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {/* Copiar Credenciales Formateadas */}
                            <button
                              onClick={() => {
                                const msg = `Hola! Bienvenido a Punk Cobros.\nAquí tienes tus credenciales para la app:\n- Correo: ${merchant.email}\n- Contraseña: ${merchant.passwordHash}\n- Plan: ${merchant.planName}\nDescarga el APK aquí: https://github.com/Alexander-Manosalva-Peralta/parlante-cobros-app/releases/download/v1.0.8/app-debug.apk`;
                                copyToClipboard(msg, `full-${merchant.id}`);
                              }}
                              className="p-1.5 rounded-lg bg-[#182030] hover:bg-[#202B40] text-gray-300 hover:text-white transition"
                              title="Copiar texto para WhatsApp"
                            >
                              {copiedId === `full-${merchant.id}` ? (
                                <Check className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                            </button>

                            {/* Suspender / Activar */}
                            <button
                              onClick={() => handleToggleStatus(merchant)}
                              className={`p-1.5 rounded-lg transition ${
                                merchant.status === "ACTIVE"
                                  ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400"
                                  : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                              }`}
                              title={merchant.status === "ACTIVE" ? "Suspender cuenta" : "Reactivar cuenta"}
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </button>

                            {/* Eliminar */}
                            <button
                              onClick={() => handleDeleteMerchant(merchant.id)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                              title="Eliminar comercio"
                            >
                              <Trash2 className="w-4 h-4" />
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
        </section>
      </main>

      {/* MODAL: CREAR NUEVO COMERCIO */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0F141F] border border-[#232D3F] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Crear Nuevo Comercio</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMerchant} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Nombre del Negocio
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Panadería San Martín"
                  value={formBusinessName}
                  onChange={(e) => setFormBusinessName(e.target.value)}
                  className="w-full bg-[#141A26] border border-[#232C3D] rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Correo Electrónico (Login)
                </label>
                <input
                  type="email"
                  required
                  placeholder="cliente@gmail.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-[#141A26] border border-[#232C3D] rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Contraseña de Acceso
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] text-emerald-400 hover:underline flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Autogenerar</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full bg-[#141A26] border border-[#232C3D] rounded-xl px-3.5 py-2.5 text-sm font-mono text-gray-200 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Plan de Cobros & Duración
                </label>
                <select
                  value={formPlan}
                  onChange={(e) => setFormPlan(e.target.value)}
                  className="w-full bg-[#141A26] border border-[#232C3D] rounded-xl px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-emerald-500 transition"
                >
                  <option value="30">Plan Pro 30 Días — S/. 35.00</option>
                  <option value="90">Plan Trimestral 90 Días — S/. 95.00</option>
                  <option value="180">Plan Semestral 180 Días — S/. 175.00</option>
                  <option value="365">Plan Anual 365 Días — S/. 320.00</option>
                </select>
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-[#232C3D] text-gray-400 hover:text-white transition text-sm font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="w-1/2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 transition text-sm font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {creating ? "Creando..." : "Crear Comercio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREDENCIALES CREADAS & MENSAJE WHATSAPP */}
      {showWhatsappModal && newMerchantData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0F141F] border border-emerald-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center space-x-3 text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">¡Comercio Creado con Éxito!</h3>
            </div>

            <p className="text-xs text-gray-300">
              Copia este mensaje preparado para enviar directamente al WhatsApp del cliente con sus credenciales y el enlace de descarga oficial de la app Punk:
            </p>

            <div className="bg-[#121824] border border-[#232C3D] rounded-xl p-4 font-mono text-xs text-gray-200 whitespace-pre-wrap select-all">
{`¡Hola! Bienvenido a Punk Cobros.
Aquí tienes tus credenciales de acceso para tu app de cobros y parlante de voz:

📱 Aplicación: Punk Cobros (Android)
🏢 Negocio: ${newMerchantData.businessName}
📧 Correo de acceso: ${newMerchantData.email}
🔑 Contraseña: ${newMerchantData.passwordHash}
⏳ Plan contratado: ${newMerchantData.planName}

Descarga el APK oficial aquí:
https://github.com/Alexander-Manosalva-Peralta/parlante-cobros-app/releases/download/v1.0.8/app-debug.apk

(Nota de seguridad: tu cuenta quedará vinculada automáticamente a tu primer teléfono celular).`}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  const msg = `¡Hola! Bienvenido a Punk Cobros.\nAquí tienes tus credenciales de acceso para tu app de cobros y parlante de voz:\n\n📱 Aplicación: Punk Cobros (Android)\n🏢 Negocio: ${newMerchantData.businessName}\n📧 Correo de acceso: ${newMerchantData.email}\n🔑 Contraseña: ${newMerchantData.passwordHash}\n⏳ Plan contratado: ${newMerchantData.planName}\n\nDescarga el APK oficial aquí:\nhttps://github.com/Alexander-Manosalva-Peralta/parlante-cobros-app/releases/download/v1.0.8/app-debug.apk\n\n(Nota de seguridad: tu cuenta quedará vinculada automáticamente a tu primer teléfono celular).`;
                  copyToClipboard(msg, "modal-copy");
                }}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold transition shadow-lg shadow-emerald-500/20"
              >
                {copiedId === "modal-copy" ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>¡Copiado al portapapeles!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Mensaje para WhatsApp</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowWhatsappModal(false)}
                className="px-4 py-3 rounded-xl border border-[#232C3D] text-gray-400 hover:text-white transition text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
