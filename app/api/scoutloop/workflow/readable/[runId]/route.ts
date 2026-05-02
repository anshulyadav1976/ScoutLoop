import { type NextRequest, NextResponse } from "next/server";
import { getRun } from "workflow/api";

type RouteContext = {
  params: Promise<{ runId: string }>;
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { runId } = await params;

  try {
    const run = await getRun(runId);
    const readable = run.getReadable();
    const encoder = new TextEncoder();
    const stream = (readable as unknown as ReadableStream).pipeThrough(
      new TransformStream({
        transform(chunk, controller) {
          const data =
            typeof chunk === "string" ? chunk : JSON.stringify(chunk);
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        },
      })
    );

    return new Response(stream, {
      headers: {
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Content-Type": "text/event-stream; charset=utf-8",
        "X-Accel-Buffering": "no",
      },
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "RUN_NOT_FOUND",
          message: `Run ${runId} not found`,
        },
      },
      { status: 404 }
    );
  }
}
