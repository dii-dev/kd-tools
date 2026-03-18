import { type NextRequest, NextResponse } from "next/server"
import { createCanvas, loadImage } from "canvas"
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

    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(qrValue, {
      width: 300,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
      errorCorrectionLevel: "H",
    })

    if (logoFile) {
      try {
        const canvas = createCanvas(300, 300)
        const ctx = canvas.getContext("2d")

        // Load and draw QR code image
        const qrImage = await loadImage(qrDataUrl)
        ctx.drawImage(qrImage, 0, 0, 300, 300)

        // Load logo - handle both PNG/JPG and SVG files
        const logoBuffer = await logoFile.arrayBuffer()
        const logoBytes = Buffer.from(logoBuffer)

        let logoImage
        try {
          logoImage = await loadImage(logoBytes)
        } catch (loadError) {
          const logoDataUrl = `data:${logoFile.type};base64,${logoBytes.toString("base64")}`
          logoImage = await loadImage(logoDataUrl)
        }

        const logoSize = 60
        const x = (300 - logoSize) / 2
        const y = (300 - logoSize) / 2
        ctx.drawImage(logoImage, x, y, logoSize, logoSize)

        const pngDataUrl = canvas.toDataURL("image/png")
        const base64Data = pngDataUrl.replace(/^data:image\/png;base64,/, "")
        const buffer = Buffer.from(base64Data, "base64")

        return new NextResponse(buffer, {
          status: 200,
          headers: {
            "Content-Type": "image/png",
            "Content-Disposition": `attachment; filename="qr-code.png"`,
          },
        })
      } catch (logoError) {
        console.error("[v0] Logo processing error:", logoError)
        // Fall back to QR code without logo
      }
    }

    // If no logo or logo processing failed, return plain QR code
    const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, "")
    const buffer = Buffer.from(base64Data, "base64")

    return new NextResponse(buffer, {
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
