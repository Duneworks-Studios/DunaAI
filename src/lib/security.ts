function pushHost(hosts: Set<string>, value: string | null | undefined) {
  const host = value?.trim();
  if (!host) return;
  hosts.add(host.toLowerCase());
}

function hostFromUrl(value: string | null | undefined) {
  const raw = value?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).host.toLowerCase();
  } catch {
    return null;
  }
}

/** Reject cross-site API posts when Origin is present. */
export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return;

  const originHost = hostFromUrl(origin);
  if (!originHost) {
    throw new Error("Invalid origin");
  }

  const allowedHosts = new Set<string>();
  pushHost(allowedHosts, request.headers.get("host"));
  pushHost(
    allowedHosts,
    request.headers.get("x-forwarded-host")?.split(",")[0],
  );
  pushHost(allowedHosts, new URL(request.url).host);
  pushHost(allowedHosts, hostFromUrl(process.env.AUTH_URL));
  pushHost(allowedHosts, hostFromUrl(process.env.NEXTAUTH_URL));

  if (!allowedHosts.has(originHost)) {
    throw new Error("Invalid origin");
  }
}
