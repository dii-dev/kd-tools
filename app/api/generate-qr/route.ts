import { type NextRequest, NextResponse } from "next/server"
import QRCode from "qrcode"
import { Buffer } from "buffer"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const qrValue = formData.get("qrValue") as string
    const logoFile = formData.get("logo") as File | null

    if (!qrValue) {
      return NextResponse.json({ error: "QR value is required" }, { status: 400 })
    }

    // Generate QR code as PNG buffer
    let qrBuffer = await QRCode.toBuffer(qrValue, {
      width: 300,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
      errorCorrectionLevel: "H",
    })

    // If logo is provided, create a simple overlay by returning both as base64
    // Client-side will handle the overlay for better compatibility
    if (logoFile) {
      const logoBuffer = await logoFile.arrayBuffer()
      const logoBase64 = Buffer.from(logoBuffer).toString("base64")
      const qrBase64 = qrBuffer.toString("base64")

      return NextResponse.json({
        qr: `data:image/png;base64,${qrBase64}`,
        logo: `data:${logoFile.type};base64,${logoBase64}`,
        hasLogo: true,
      })
    }

    return new NextResponse(qrBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="qr-code.png"`,
      },
    })
  } catch (error) {
    console.error("[v0] QR generation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate QR code" },
      { status: 500 },
    )
  }
}
