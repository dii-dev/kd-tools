import { type NextRequest, NextResponse } from "next/server"
import QRCode from "qrcode"
import { createCanvas, loadImage } from "canvas"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type FrameStyle = "none" | "rounded" | "badge" | "scan"

function clampColor(value: string | null, fallback: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value || "") ? (value as string) : fallback
}

function roundedRect(ctx: ReturnType<typeof createCanvas>["getContext"], x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function fitText(
  ctx: ReturnType<typeof createCanvas>["getContext"],
  text: string,
  maxWidth: number,
  initialSize: number,
  fontFamily: string,
  fontWeight = 700,
) {
  let fontSize = initialSize
  do {
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
    if (ctx.measureText(text).width <= maxWidth || fontSize <= 18) {
      break
    }
    fontSize -= 2
  } while (fontSize > 18)

  return fontSize
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const qrValue = formData.get("qrValue") as string
    const logoFile = formData.get("logo") as File | null
    const darkColor = clampColor(formData.get("darkColor") as string | null, "#111111")
    const lightColor = clampColor(formData.get("lightColor") as string | null, "#ffffff")
    const frameColor = clampColor(formData.get("frameColor") as string | null, "#d97706")
    const frameStyle = ((formData.get("frameStyle") as string | null) || "rounded") as FrameStyle
    const language = ((formData.get("language") as string | null) || "km").toLowerCase()
    const scanLabel = ((formData.get("scanLabel") as string | null) || "SCAN ME").trim() || "SCAN ME"

    if (!qrValue) {
      return NextResponse.json({ error: "QR value is required" }, { status: 400 })
    }

    const qrDataUrl = await QRCode.toDataURL(qrValue, {
      width: 280,
      margin: 1,
      color: {
        dark: darkColor,
        light: lightColor,
      },
      errorCorrectionLevel: "H",
    })

    const qrImage = await loadImage(qrDataUrl)
    const canvasWidth = frameStyle === "none" ? 320 : frameStyle === "scan" ? 420 : 380
    const canvasHeight = frameStyle === "scan" ? 520 : canvasWidth
    const canvas = createCanvas(canvasWidth, canvasHeight)
    const ctx = canvas.getContext("2d")

    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    const footerHeight = frameStyle === "scan" ? 108 : 0
    const framePadding = frameStyle === "none" ? 20 : frameStyle === "scan" ? 28 : 28
    const qrBoxSize =
      frameStyle === "scan"
        ? canvasWidth - framePadding * 2 - 16
        : canvasWidth - framePadding * 2 - footerHeight

    if (frameStyle === "rounded") {
      ctx.fillStyle = frameColor
      roundedRect(ctx, 8, 8, canvasWidth - 16, canvasHeight - 16, 34)
      ctx.fill()
    } else if (frameStyle === "badge") {
      ctx.fillStyle = frameColor
      roundedRect(ctx, 0, 0, canvasWidth, canvasHeight, 42)
      ctx.fill()
      ctx.fillStyle = "rgba(255,255,255,0.12)"
      roundedRect(ctx, 18, 18, canvasWidth - 36, canvasHeight - 36, 28)
      ctx.fill()
    } else if (frameStyle === "scan") {
      ctx.fillStyle = frameColor
      roundedRect(ctx, 0, 0, canvasWidth, canvasHeight, 24)
      ctx.fill()
    }

    ctx.fillStyle = lightColor
    if (frameStyle === "none") {
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    } else if (frameStyle === "scan") {
      roundedRect(ctx, framePadding, framePadding, qrBoxSize, qrBoxSize, 14)
      ctx.fill()
    } else {
      roundedRect(
        ctx,
        framePadding - 8,
        framePadding - 8,
        qrBoxSize + 16,
        qrBoxSize + 16 + footerHeight,
        24,
      )
      ctx.fill()
    }

    ctx.drawImage(qrImage, framePadding, framePadding, qrBoxSize, qrBoxSize)

    if (frameStyle === "scan") {
      ctx.fillStyle = lightColor
      const isKhmer = language === "km" || /[\u1780-\u17FF]/.test(scanLabel)
      const fontFamily = isKhmer
        ? '"Kantumruy Pro", "Noto Sans Khmer", "Khmer OS", sans-serif'
        : '"Poppins", Arial, sans-serif'
      const fontSize = fitText(ctx, scanLabel, canvasWidth - 64, isKhmer ? 44 : 54, fontFamily)
      ctx.font = `700 ${fontSize}px ${fontFamily}`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(scanLabel, canvasWidth / 2, framePadding + qrBoxSize + footerHeight / 2)
    }

    if (logoFile && frameStyle !== "scan") {
      const arrayBuffer = await logoFile.arrayBuffer()
      const logoImage = await loadImage(Buffer.from(arrayBuffer))
      const logoSize = Math.round(qrBoxSize * 0.22)
      const logoX = (canvasWidth - logoSize) / 2
      const logoY = framePadding + (qrBoxSize - logoSize) / 2
      const backdropPadding = 12

      ctx.fillStyle = lightColor
      roundedRect(
        ctx,
        logoX - backdropPadding / 2,
        logoY - backdropPadding / 2,
        logoSize + backdropPadding,
        logoSize + backdropPadding,
        18,
      )
      ctx.fill()

      ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize)
    }

    const qrBuffer = canvas.toBuffer("image/png")

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
