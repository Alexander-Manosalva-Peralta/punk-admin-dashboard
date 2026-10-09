import { NextRequest, NextResponse } from "next/server";
import { validateDeviceLogin } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, deviceId } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Correo y contraseña requeridos." },
        { status: 400 }
      );
    }

    const result = await validateDeviceLogin(
      email,
      password,
      deviceId || "anonymous_device"
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      merchantName: result.merchantName,
      planName: result.planName,
      daysRemaining: result.daysRemaining,
      token: result.token,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Error interno del servidor Punk API." },
      { status: 500 }
    );
  }
}
