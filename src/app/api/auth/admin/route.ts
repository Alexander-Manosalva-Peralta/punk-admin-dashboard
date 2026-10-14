import { NextRequest, NextResponse } from "next/server";
import { ADMIN_AUTH_TOKEN, DEFAULT_ADMIN_USER, DEFAULT_ADMIN_PASS, isAuthorizedAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    const trimmedUser = (username || "").trim().toLowerCase();
    const trimmedPass = (password || "").trim();

    const validUser = DEFAULT_ADMIN_USER.toLowerCase();
    const isValidUsername = trimmedUser === validUser || trimmedUser === "admin@punk.com" || trimmedUser === "admin";
    const isValidPassword = trimmedPass === DEFAULT_ADMIN_PASS;

    if (isValidUsername && isValidPassword) {
      return NextResponse.json({
        success: true,
        token: ADMIN_AUTH_TOKEN,
        user: {
          username: "admin",
          email: "admin@punk.com",
          role: "SUPER_ADMIN",
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Credenciales de administrador inválidas. Verifica usuario y contraseña.",
      },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Error procesando inicio de sesión de administrador." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const isAuth = isAuthorizedAdmin(req);
  return NextResponse.json({ authenticated: isAuth });
}
