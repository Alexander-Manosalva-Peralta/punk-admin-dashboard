import { supabase, isSupabaseConfigured } from "./supabase";

export interface Merchant {
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

// Store en memoria con datos iniciales para funcionamiento instantáneo
let localMerchants: Merchant[] = [
  {
    id: "m-001",
    businessName: "Bodega Don Pepe",
    email: "donpepe@gmail.com",
    passwordHash: "pepe2026",
    planName: "Plan Pro 30 Días",
    daysDuration: 30,
    priceSoles: 35.0,
    status: "ACTIVE",
    boundDeviceId: "android_98af21d0a",
    firstLoginAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 28 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "m-002",
    businessName: "Farmacia Santa Rosa",
    email: "santarosa@gmail.com",
    passwordHash: "rosa2026",
    planName: "Plan Trimestral 90 Días",
    daysDuration: 90,
    priceSoles: 95.0,
    status: "ACTIVE",
    boundDeviceId: "android_c4b12aa09",
    firstLoginAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 84 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: "m-003",
    businessName: "Minimarket Los Olivos",
    email: "losolivos@gmail.com",
    passwordHash: "olivos2026",
    planName: "Plan Anual 365 Días",
    daysDuration: 365,
    priceSoles: 320.0,
    status: "ACTIVE",
    boundDeviceId: null,
    firstLoginAt: null,
    expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: "m-004",
    businessName: "Librería San Martín",
    email: "sanmartin@gmail.com",
    passwordHash: "martin2026",
    planName: "Plan Pro 30 Días",
    daysDuration: 30,
    priceSoles: 35.0,
    status: "EXPIRED",
    boundDeviceId: "android_5788fbc01",
    firstLoginAt: new Date(Date.now() - 32 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 32 * 86400000).toISOString(),
  },
];

export async function getMerchants(): Promise<Merchant[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("merchants")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        return data.map(mapDbMerchant);
      }
    } catch (e) {
      console.warn("Supabase no disponible, usando fallback local:", e);
    }
  }
  return [...localMerchants];
}

export async function getMerchantByEmail(email: string): Promise<Merchant | null> {
  const cleanEmail = email.trim().toLowerCase();
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("merchants")
        .select("*")
        .eq("email", cleanEmail)
        .single();
      if (!error && data) {
        return mapDbMerchant(data);
      }
    } catch (_) {}
  }
  return localMerchants.find((m) => m.email.toLowerCase() === cleanEmail) || null;
}

export async function createMerchant(data: {
  businessName: string;
  email: string;
  passwordHash: string;
  planName: string;
  daysDuration: number;
  priceSoles: number;
}): Promise<Merchant> {
  const cleanEmail = data.email.trim().toLowerCase();
  const expiresAt = new Date(Date.now() + data.daysDuration * 86400000).toISOString();

  const newMerchant: Merchant = {
    id: `m-${Date.now()}`,
    businessName: data.businessName,
    email: cleanEmail,
    passwordHash: data.passwordHash,
    planName: data.planName,
    daysDuration: data.daysDuration,
    priceSoles: data.priceSoles,
    status: "ACTIVE",
    boundDeviceId: null,
    firstLoginAt: null,
    expiresAt,
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: inserted, error } = await supabase
        .from("merchants")
        .insert({
          business_name: newMerchant.businessName,
          email: newMerchant.email,
          password_hash: newMerchant.passwordHash,
          plan_name: newMerchant.planName,
          days_duration: newMerchant.daysDuration,
          price_soles: newMerchant.priceSoles,
          status: newMerchant.status,
          expires_at: newMerchant.expiresAt,
        })
        .select()
        .single();
      if (!error && inserted) {
        return mapDbMerchant(inserted);
      }
    } catch (_) {}
  }

  localMerchants.unshift(newMerchant);
  return newMerchant;
}

export async function updateMerchantStatus(
  id: string,
  status: "ACTIVE" | "EXPIRED" | "SUSPENDED"
): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from("merchants")
        .update({ status })
        .eq("id", id);
      if (!error) return true;
    } catch (_) {}
  }

  const idx = localMerchants.findIndex((m) => m.id === id);
  if (idx !== -1) {
    localMerchants[idx].status = status;
    return true;
  }
  return false;
}

export async function resetMerchantDevice(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from("merchants")
        .update({ bound_device_id: null })
        .eq("id", id);
      if (!error) return true;
    } catch (_) {}
  }

  const idx = localMerchants.findIndex((m) => m.id === id);
  if (idx !== -1) {
    localMerchants[idx].boundDeviceId = null;
    return true;
  }
  return false;
}

export async function deleteMerchant(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from("merchants").delete().eq("id", id);
      if (!error) return true;
    } catch (_) {}
  }

  localMerchants = localMerchants.filter((m) => m.id !== id);
  return true;
}

export async function validateDeviceLogin(
  email: string,
  passwordAttempt: string,
  deviceId: string
): Promise<{
  success: boolean;
  message?: string;
  merchantName?: string;
  planName?: string;
  daysRemaining?: number;
  token?: string;
}> {
  const merchant = await getMerchantByEmail(email);
  if (!merchant) {
    return { success: false, message: "Comercio no encontrado en el sistema Punk." };
  }

  if (merchant.passwordHash !== passwordAttempt) {
    return { success: false, message: "Contraseña incorrecta. Contacta a tu administrador." };
  }

  if (merchant.status === "SUSPENDED") {
    return { success: false, message: "Tu cuenta ha sido suspendida. Contacta a Punk Soporte." };
  }

  const expiresTime = new Date(merchant.expiresAt).getTime();
  const now = Date.now();
  if (now > expiresTime || merchant.status === "EXPIRED") {
    return {
      success: false,
      message: "Tu suscripción ha vencido. Renueva tu plan con el administrador.",
    };
  }

  // PROTECCIÓN ANTI-PIRATERÍA (Device Locking):
  // Si no tenía dispositivo vinculado, se vincula en el primer inicio de sesión:
  if (!merchant.boundDeviceId) {
    merchant.boundDeviceId = deviceId;
    merchant.firstLoginAt = new Date().toISOString();
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from("merchants")
          .update({
            bound_device_id: deviceId,
            first_login_at: merchant.firstLoginAt,
          })
          .eq("id", merchant.id);
      } catch (_) {}
    }
  } else if (merchant.boundDeviceId !== deviceId) {
    // Si ya está vinculado a OTRO celular:
    return {
      success: false,
      message:
        "Esta cuenta ya está activa en otro teléfono celular. Para cambiar de equipo, solicita al administrador desvincular tu dispositivo.",
    };
  }

  const daysRemaining = Math.max(0, Math.ceil((expiresTime - now) / 86400000));

  return {
    success: true,
    merchantName: merchant.businessName,
    planName: merchant.planName,
    daysRemaining,
    token: `PUNK_JWT_${merchant.id}_${Date.now()}`,
  };
}

export async function getBiMetrics() {
  const merchants = await getMerchants();
  const total = merchants.length;
  const active = merchants.filter((m) => m.status === "ACTIVE").length;
  const expired = merchants.filter((m) => m.status === "EXPIRED").length;
  const suspended = merchants.filter((m) => m.status === "SUSPENDED").length;

  const totalRevenue = merchants.reduce((sum, m) => sum + (m.priceSoles || 0), 0);
  const activeRevenue = merchants
    .filter((m) => m.status === "ACTIVE")
    .reduce((sum, m) => sum + (m.priceSoles || 0), 0);

  const planBreakdown = {
    monthly: merchants.filter((m) => m.daysDuration === 30).length,
    quarterly: merchants.filter((m) => m.daysDuration === 90).length,
    annual: merchants.filter((m) => m.daysDuration === 365).length,
  };

  return {
    totalMerchants: total,
    activeMerchants: active,
    expiredMerchants: expired,
    suspendedMerchants: suspended,
    totalRevenue,
    activeRevenue,
    planBreakdown,
  };
}

function mapDbMerchant(db: any): Merchant {
  return {
    id: db.id,
    businessName: db.business_name,
    email: db.email,
    passwordHash: db.password_hash,
    planName: db.plan_name,
    daysDuration: db.days_duration,
    priceSoles: Number(db.price_soles),
    status: db.status,
    boundDeviceId: db.bound_device_id,
    firstLoginAt: db.first_login_at,
    expiresAt: db.expires_at,
    createdAt: db.created_at,
  };
}
