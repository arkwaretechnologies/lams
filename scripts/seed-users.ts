/**
 * Seed bootstrap users for LAMS.
 * Run: npm run seed:users
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";
import { ALL_PERMISSION_KEYS } from "../src/lib/permissions";

function loadEnv() {
  try {
    const content = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      process.env[key] = value;
    }
  } catch {
    // optional
  }
}

loadEnv();

type BootstrapUser = { name: string; email: string; password: string };

function getBootstrapUsers(): BootstrapUser[] {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const adminName = process.env.SEED_ADMIN_NAME ?? "LAMS Administrator";

  if (!adminEmail || !adminPassword) {
    console.error(
      "Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env.local (see .env.example)"
    );
    process.exit(1);
  }

  return [{ name: adminName, email: adminEmail, password: adminPassword }];
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: adminRole } = await supabase
    .from("roles")
    .select("id, slug, name")
    .eq("slug", "administrator")
    .single();

  if (!adminRole) {
    console.error("Administrator role not found. Run migrations first.");
    process.exit(1);
  }

  const appMetadata = {
    role_id: adminRole.id,
    role_slug: adminRole.slug,
    permissions: ALL_PERMISSION_KEYS,
  };

  for (const user of getBootstrapUsers()) {
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", user.email)
      .maybeSingle();

    if (existingProfile) {
      await supabase
        .from("profiles")
        .update({ full_name: user.name, role_id: adminRole.id, status: true })
        .eq("id", existingProfile.id);

      await supabase.auth.admin.updateUserById(existingProfile.id, {
        app_metadata: appMetadata,
      });

      console.log(`Updated existing user: ${user.email}`);
      continue;
    }

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      app_metadata: appMetadata,
    });

    if (authError || !authUser.user) {
      console.error(`Failed to create ${user.email}:`, authError?.message);
      continue;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: authUser.user.id,
      full_name: user.name,
      email: user.email,
      role_id: adminRole.id,
      status: true,
    });

    if (profileError) {
      console.error(`Profile error for ${user.email}:`, profileError.message);
      await supabase.auth.admin.deleteUser(authUser.user.id);
      continue;
    }

    console.log(`Created user: ${user.email}`);
  }

  console.log("\nBootstrap complete.");
  console.log("Ensure Supabase Auth > Email > Confirm email is DISABLED.");
}

main();
