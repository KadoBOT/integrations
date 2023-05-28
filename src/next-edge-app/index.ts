import { NextRequest, NextResponse } from "next/server"

export function filterRequestHeaders(
  headers: Headers,
  forwardAdditionalHeaders?: string[],
): Headers {
  const defaultForwardedHeaders = [
    "accept",
    "accept-charset",
    "accept-encoding",
    "accept-language",
    "authorization",
    "cache-control",
    "content-type",
    "cookie",
    "host",
    "user-agent",
    "referer",
  ]

  const filteredHeaders = new Headers()
  headers.forEach((value, key) => {
    const isValid =
      defaultForwardedHeaders.includes(key) ||
      (forwardAdditionalHeaders ?? []).includes(key)
    if (isValid) filteredHeaders.set(key, value)
  })

  return filteredHeaders
}

const handler = async (
  request: NextRequest,
  { params }: { params: { path: string[] } },
) => {
  const url = request.nextUrl
  const flow = url.searchParams.get("flow")

  const path = request.nextUrl.pathname.replace("/api/.ory", "")
  const flowUrl = new URL(
    `${process.env.ORY_SDK_URL}${path}${request.nextUrl.search}`,
  )

  if (!flow) {
    NextResponse.redirect(flowUrl.toString())
  }

  const body = await request.json()

  const headers = filterRequestHeaders(request.headers)
  headers.set("X-Ory-Base-URL-Rewrite", "false")
  headers.set("Ory-Base-URL-Rewrite", "false")
  headers.set("Ory-No-Custom-Domain-Redirect", "true")

  const payload = {
    method: request.method,
    headers,
    body: JSON.stringify(body),
  }

  const resp = await fetch(flowUrl.toString(), payload)

  return resp
}

export { handler as GET, handler as POST }