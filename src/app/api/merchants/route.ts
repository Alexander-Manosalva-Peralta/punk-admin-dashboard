import { NextRequest, NextResponse } from "next/server";
import { getMerchants, createMerchant, updateMerchantStatus, resetMerchantDevice, deleteMerchant } from "@/lib/db";

export async function GET() {
  try {
    const list = await getMerchants();
    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessName, email, password, daysDuration, priceSoles, planName } = body;

    if (!businessName || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Nombre de negocio, correo y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    const created = await createMerchant({
      businessName,
      email,
      passwordHash: password,
      planName: planName || `Plan ${daysDuration || 30} Días`,
      daysDuration: Number(daysDuration) || 30,
      priceSoles: Number(priceSoles) || 35.0,
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action, status } = body;

    if (!id || !action) {
      return NextResponse.json({ success: false, message: "Parámetros incompletos." }, { status: 400 });
    }

    if (action === "CHANGE_STATUS") {
      await updateMerchantStatus(id, status);
      return NextResponse.json({ success: true });
    }

    if (action === "RESET_DEVICE") {
      await resetMerchantDevice(id);
      return NextResponse.json({ success: true, message: "Dispositivo desvinculado con éxito." });
    }

    return NextResponse.json({ success: false, message: "Acción no reconocida." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "ID de comercio requerido." }, { status: 400 });
    }

    await deleteMerchant(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
