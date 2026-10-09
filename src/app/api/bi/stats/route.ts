import { NextResponse } from "next/server";
import { getBiMetrics } from "@/lib/db";

export async function GET() {
  try {
    const stats = await getBiMetrics();
    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
