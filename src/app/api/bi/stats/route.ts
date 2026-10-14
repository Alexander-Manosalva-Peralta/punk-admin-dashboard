import { NextRequest, NextResponse } from "next/server";
import { getBiMetrics } from "@/lib/db";
import { isAuthorizedAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ success: false, message: "Acceso no autorizado al panel administrativo." }, { status: 401 });
  }

  try {
    const stats = await getBiMetrics();
    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
