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

// Store en memoria con datos iniciales: PAGO ÚNICO VITALICIO S/. 10.00
let localMerchants: Merchant[] = [
  {
    id: "m-001",
    businessName: "Bodega Don Pepe",
    email: "donpepe@gmail.com",
    passwordHash: "pepe2026",
    planName: "Pago Único Vitalicio (De por vida)",
    daysDuration: 36500,
    priceSoles: 10.0,
    status: "ACTIVE",
    boundDeviceId: "android_98af21d0a",
    firstLoginAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 36500 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "m-002",
    businessName: "Farmacia Santa Rosa",
    email: "santarosa@gmail.com",
    passwordHash: "rosa2026",
    planName: "Pago Único Vitalicio (De por vida)",
    daysDuration: 36500,
    priceSoles: 10.0,
    status: "ACTIVE",
    boundDeviceId: "android_c4b12aa09",
    firstLoginAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 36500 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: "m-003",
    businessName: "Minimarket Los Olivos",
    email: "losolivos@gmail.com",
    passwordHash: "olivos2026",
    planName: "Pago Único Vitalicio (De por vida)",
    daysDuration: 36500,
    priceSoles: 10.0,
    status: "ACTIVE",
    boundDeviceId: null,
    firstLoginAt: null,
    expiresAt: new Date(Date.now() + 36500 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
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
  planName?: string;
  daysDuration?: number;
  priceSoles?: number;
}): Promise<Merchant> {
  const cleanEmail = data.email.trim().toLowerCase();
  const planName = data.planName || "Pago Único Vitalicio (De por vida)";
  const daysDuration = data.daysDuration || 36500;
  const priceSoles = data.priceSoles !== undefined ? data.priceSoles : 10.0;
  const expiresAt = new Date(Date.now() + daysDuration * 86400000).toISOString();

  const newMerchant: Merchant = {
    id: `m-${Date.now()}`,
    businessName: data.businessName,
    email: cleanEmail,
    passwordHash: data.passwordHash,
    planName,
    daysDuration,
    priceSoles,
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

  return {
    success: true,
    merchantName: merchant.businessName,
    planName: "Pago Único Vitalicio (De por vida)",
    daysRemaining: 9999,
    token: `PUNK_JWT_${merchant.id}_${Date.now()}`,
  };
}

export async function getBiMetrics() {
  const merchants = await getMerchants();
  const total = merchants.length;
  const active = merchants.filter((m) => m.status === "ACTIVE").length;
  const suspended = merchants.filter((m) => m.status === "SUSPENDED").length;
  const boundDevices = merchants.filter((m) => m.boundDeviceId).length;

  // Cada cliente = S/. 10.00 pago único de por vida
  const totalRevenue = merchants.reduce((sum, m) => sum + (m.priceSoles || 10.0), 0);

  return {
    totalMerchants: total,
    activeMerchants: active,
    expiredMerchants: 0,
    suspendedMerchants: suspended,
    totalRevenue,
    activeRevenue: totalRevenue,
    boundDevices,
    planBreakdown: {
      lifetime: total,
      monthly: 0,
      quarterly: 0,
      annual: 0,
    },
  };
}

function mapDbMerchant(db: any): Merchant {
  return {
    id: db.id,
    businessName: db.business_name,
    email: db.email,
    passwordHash: db.password_hash,
    planName: db.plan_name || "Pago Único Vitalicio (De por vida)",
    daysDuration: db.days_duration || 36500,
    priceSoles: db.price_soles !== undefined ? Number(db.price_soles) : 10.0,
    status: db.status || "ACTIVE",
    boundDeviceId: db.bound_device_id,
    firstLoginAt: db.first_login_at,
    expiresAt: db.expires_at || new Date(Date.now() + 36500 * 86400000).toISOString(),
    createdAt: db.created_at || new Date().toISOString(),
  };
}
