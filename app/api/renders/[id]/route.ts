import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const renderId = params.id

    // TODO(Cursor): Replace with real render data from backend
    const mockRender = {
      id: renderId,
      pdfUrl: "/placeholder.pdf",
      pngUrl: "/professional-brochure-preview.jpg",
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json(mockRender)
  } catch (error) {
    return NextResponse.json({ error: "Failed to get render" }, { status: 500 })
  }
}
