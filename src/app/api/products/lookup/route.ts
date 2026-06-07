import { NextResponse } from "next/server";
import { lookupBarcodeOnline } from "@/lib/products/barcodeLookup";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const barcode = searchParams.get("barcode")?.trim();

  if (!barcode) {
    return NextResponse.json({ error: "Barkod gerekli" }, { status: 400 });
  }

  const result = await lookupBarcodeOnline(barcode);

  if (!result) {
    return NextResponse.json(
      { found: false, barcode: barcode.replace(/\D/g, "") },
      { status: 404 }
    );
  }

  return NextResponse.json({ found: true, product: result });
}
