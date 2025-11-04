import "server-only";

import { authentication, createDirectus, createUser, readItems, rest, staticToken, readUsers } from "@directus/sdk";

type DirectusUser = {
  id: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  display_name?: string | null;
};

type DirectusAuthResponse = {
  access_token: string;
  refresh_token: string;
  expires: number;
  expires_at: string;
  user: DirectusUser;
};

const directusUrl = process.env.DIRECTUS_URL as string;
const directusAdminToken = process.env.DIRECTUS_TOKEN as string;
const defaultRoleId = process.env.DIRECTUS_DEFAULT_ROLE_ID;

function getAdminClient() {
  if (!directusUrl) throw new Error("DIRECTUS_URL is not set");
  if (!directusAdminToken) throw new Error("DIRECTUS_TOKEN is not set");

  return createDirectus(directusUrl).with(staticToken(directusAdminToken)).with(rest());
}

function getAuthClient() {
  if (!directusUrl) throw new Error("DIRECTUS_URL is not set");

  return createDirectus(directusUrl).with(authentication("json", { autoRefresh: false })).with(rest());
}

export async function loginWithDirectus(email: string, password: string) {
  const client = getAuthClient();

  try {
    const auth = (await client.login({ email, password }, { mode: "json" }));

    const directusUser = await ensureDirectusUser({ email: email });

    const expiresAt = auth.expires_at ?? (auth.expires ? Date.now() + auth.expires : null);
    const normalizedExpiresAt =
      typeof expiresAt === "number" ? new Date(expiresAt).toISOString() : expiresAt ?? new Date().toISOString();

    const normalizedAuth = {
      ...auth,
      user: directusUser,
      expires_at: normalizedExpiresAt,
    };

    return normalizedAuth;
  } catch (error: any) {
    throw new Error(error?.errors?.[0]?.message ?? error?.message ?? "Invalid credentials");
  }
}

type EnsureDirectusUserArgs = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  provider?: string;
};


export async function ensureDirectusUser({ email, firstName, lastName, displayName, provider }: EnsureDirectusUserArgs) {
  const client = getAdminClient();

  const results = await client.request(
    readUsers ({
      filter: { email: { _eq: email } },
      limit: 1,
      fields: ["id", "email", "first_name", "last_name"],
    }),
  );

  if (results.length > 0) {
    const [existing] = results as DirectusUser[];
    if (!existing.display_name && displayName) {
      await fetch(`${directusUrl}/users/${existing.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${directusAdminToken}`,
        },
        body: JSON.stringify({ display_name: displayName }),
      }).catch(() => undefined);
    }
    return existing;
  }

  const payload: Record<string, unknown> = {
    email,
    first_name: firstName ?? undefined,
    last_name: lastName ?? undefined,
    display_name: displayName ?? firstName ?? lastName ?? email,
    status: "active",
  };

  if (defaultRoleId) {
    payload.role = defaultRoleId;
  }

  if (provider) {
    payload.provider = provider;
  }

  const response = await fetch(`${directusUrl}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${directusAdminToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.errors?.[0]?.message ?? "Failed to create Directus user");
  }

  const { data } = (await response.json()) as { data: DirectusUser };
  return data;
}

type RegisterArgs = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
};

export async function registerDirectusUser({ email, password, firstName, lastName, displayName }: RegisterArgs) {
  const payload: Record<string, unknown> = {
    email,
    password,
    first_name: firstName ?? undefined,
    last_name: lastName ?? undefined,
    display_name: (displayName ?? [firstName, lastName].filter(Boolean).join(" "))|| email,
    status: "active",
  };

  if (defaultRoleId) {
    payload.role = defaultRoleId;
  }

  try {
    const client = getAdminClient();
    const user = await client.request(
      createUser(payload, {
        fields: ["id", "email", "first_name", "last_name", "display_name"] as const,
      }),
    );
    return { ok: true as const, user: user as DirectusUser };
  } catch (error: any) {
    const message = error?.errors?.[0]?.message ?? error?.message ?? "Failed to register";
    const status = error?.response?.status;

    if (status === 400 || status === 409) {
      return { ok: false as const, error: message };
    }

    throw new Error(message);
  }
}

type TokenRefreshResponse = {
  access_token: string;
  refresh_token: string;
  expires: number;
  expires_at: string;
};

export async function refreshDirectusToken(refreshToken: string) {
  const response = await fetch(`${directusUrl}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh Directus token");
  }

  return (await response.json()) as TokenRefreshResponse;
}
