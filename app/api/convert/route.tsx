export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"

function sanitizeFilename(filename: string): string {
  // Remove or replace non-ASCII characters with safe alternatives
  return filename
    .normalize("NFD") // Decompose combined characters
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^\x00-\x7F]/g, "_") // Replace non-ASCII with underscore
    .replace(/[<>:"/\\|?*]/g, "_") // Replace invalid filename characters
    .trim()
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const conversionType = formData.get("conversionType") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()

    let resultBuffer: ArrayBuffer
    let contentType: string
    let filename: string

    switch (conversionType) {
      case "word-to-pdf":
        resultBuffer = await convertWordToPdf(buffer, file.name)
        contentType = "application/pdf"
        filename = file.name.replace(/\.(doc|docx)$/i, ".pdf")
        break

      case "pdf-to-word":
        resultBuffer = await convertPdfToWord(buffer, file.name)
        contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        filename = file.name.replace(/\.pdf$/i, ".docx")
        break

      case "image-to-word":
        resultBuffer = await convertImageToWord(buffer, file.name)
        contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        filename = file.name.replace(/\.(jpg|jpeg|png|gif|webp)$/i, ".docx")
        break

      case "image-to-pdf":
        resultBuffer = await convertImageToPdf(buffer, file.type)
        contentType = "application/pdf"
        filename = file.name.replace(/\.(jpg|jpeg|png|gif|webp)$/i, ".pdf")
        break

      default:
        return NextResponse.json({ error: "Invalid conversion type" }, { status: 400 })
    }

    const safeFilename = sanitizeFilename(filename)

    return new NextResponse(resultBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
      },
    })
  } catch (error) {
    console.error("[v0] Conversion error:", error)
    return NextResponse.json({ error: "Conversion failed: " + (error as Error).message }, { status: 500 })
  }
}

async function convertWordToPdf(buffer: ArrayBuffer, filename: string): Promise<ArrayBuffer> {
  // Use mammoth to extract text from Word document
  const mammoth = await import("mammoth")
  const result = await mammoth.extractRawText({ arrayBuffer: buffer })
  const text = result.value

  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontSize = 12
  const margin = 50
  const lineHeight = fontSize + 5

  let page = pdfDoc.addPage([595, 842]) // A4 size
  let { height } = page.getSize()
  let yPosition = height - margin
  const maxWidth = 495

  const lines = text.split("\n")

  for (const line of lines) {
    // Wrap long lines
    const words = line.split(" ")
    let currentLine = ""

    for (const word of words) {
      const testLine = currentLine + (currentLine ? " " : "") + word
      const textWidth = font.widthOfTextAtSize(testLine, fontSize)

      if (textWidth > maxWidth && currentLine) {
        // Draw current line
        const safeLine = currentLine.replace(/[^\x00-\x7F]/g, "?")
        page.drawText(safeLine, {
          x: margin,
          y: yPosition,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0),
        })
        yPosition -= lineHeight
        currentLine = word

        // Add new page if needed
        if (yPosition < margin) {
          page = pdfDoc.addPage([595, 842])
          height = page.getSize().height
          yPosition = height - margin
        }
      } else {
        currentLine = testLine
      }
    }

    // Draw remaining text
    if (currentLine) {
      const safeLine = currentLine.replace(/[^\x00-\x7F]/g, "?")
      page.drawText(safeLine, {
        x: margin,
        y: yPosition,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      })
      yPosition -= lineHeight

      if (yPosition < margin) {
        page = pdfDoc.addPage([595, 842])
        height = page.getSize().height
        yPosition = height - margin
      }
    }
  }

  return await pdfDoc.save()
}

async function convertPdfToWord(buffer: ArrayBuffer, filename: string): Promise<ArrayBuffer> {
  const pdfParse = (await import("pdf-parse")).default
  const pdfData = await pdfParse(Buffer.from(buffer))
  const text = pdfData.text

  const { Document, Paragraph, TextRun, Packer } = await import("docx")

  const paragraphs = text.split("\n").map(
    (line) =>
      new Paragraph({
        children: [new TextRun(line || " ")],
      }),
  )

  const doc = new Document({
    sections: [
      {
        children: paragraphs,
      },
    ],
  })

  const docBuffer = await Packer.toBuffer(doc)
  return docBuffer.buffer
}

async function convertImageToWord(buffer: ArrayBuffer, filename: string): Promise<ArrayBuffer> {
  const Tesseract = await import("tesseract.js")
  const { createWorker } = Tesseract

  const worker = await createWorker("eng")
  const imageBuffer = Buffer.from(buffer)

  const {
    data: { text },
  } = await worker.recognize(imageBuffer)
  await worker.terminate()

  const { Document, Paragraph, TextRun, Packer } = await import("docx")

  const paragraphs = text.split("\n").map(
    (line) =>
      new Paragraph({
        children: [new TextRun(line || " ")],
      }),
  )

  const doc = new Document({
    sections: [
      {
        children: paragraphs,
      },
    ],
  })

  const docBuffer = await Packer.toBuffer(doc)
  return docBuffer.buffer
}

async function convertImageToPdf(buffer: ArrayBuffer, mimeType: string): Promise<ArrayBuffer> {
  const pdfDoc = await PDFDocument.create()

  let image
  if (mimeType.includes("png")) {
    image = await pdfDoc.embedPng(buffer)
  } else if (mimeType.includes("jpg") || mimeType.includes("jpeg")) {
    image = await pdfDoc.embedJpg(buffer)
  } else {
    throw new Error("Unsupported image format. Please use PNG or JPG.")
  }

  const { width, height } = image.scale(1)

  const page = pdfDoc.addPage([width, height])

  page.drawImage(image, {
    x: 0,
    y: 0,
    width: width,
    height: height,
  })

  return await pdfDoc.save()
}
