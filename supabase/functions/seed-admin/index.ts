import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const email = "testadmin@thaisilk.local";
  const password = "123456ui";
  const username = "testadmin";

  // Check if already exists
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .single();

  if (existing) {
    return new Response(JSON.stringify({ message: "Admin already exists" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    return new Response(JSON.stringify({ error: authError.message }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const userId = authData.user.id;

  // Create profile
  await supabase.from("profiles").insert({
    user_id: userId,
    first_name: "Admin",
    last_name: "System",
    username,
    email,
    status: "active",
  });

  // Assign admin role
  await supabase.from("user_roles").insert({
    user_id: userId,
    role: "admin",
  });

  return new Response(JSON.stringify({ message: "Admin created", email, username }), {
    headers: { "Content-Type": "application/json" },
  });
});
