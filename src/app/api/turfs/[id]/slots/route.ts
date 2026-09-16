import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || "";
  return NextResponse.redirect(new URL(`/api/grounds/${params.id}/slots?date=${date}`, req.url));
}
