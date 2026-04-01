import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const email = "testadmin1@thaisilk.local";
  const password = "123456ui";
  const username = "testadmin1";

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) return new Response(JSON.stringify({ error: authError.message }), { status: 400 });

  const userId = authData.user.id;

  await supabase.from("profiles").insert({
    user_id: userId,
    first_name: "Admin",
    last_name: "Test",
    username,
    email,
    status: "active",
  });

  await supabase.from("user_roles").insert({
    user_id: userId,
    role: "admin",
  });

  return new Response(JSON.stringify({ success: true, userId }), { status: 200 });
});
