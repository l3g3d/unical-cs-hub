// Supabase Edge Function: gemini-assistant
// Handles natural language commands for UNICAL CS HUB Admin operations
// Validates admin credentials before processing any actions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user & check admin role
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check user_roles table for 'admin'
    const { data: roles, error: roleError } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin");

    if (roleError || !roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: "Forbidden: Admin privileges required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { message, history } = await req.json();
    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY") || "";

    // Call Gemini API with system instructions and tools
    const systemPrompt = `You are the official AI Admin Assistant for UNICAL CS HUB (Department of Computer Science, University of Calabar, 100 Level).
You help the course representative and departmental administrators manage timetables, assignments, lecture venues, and academic events.
The seven 100 level courses are:
1. COS101 - Introduction to Computer Sciences
2. CSC181 - Computer Laboratory IA
3. GST111 - Communication in English
4. MTH101 - Elementary Mathematics 1
5. PHY101 - Introduction to Physics I
6. PHY107 - General Physics Practical I
7. STA111 - Basic Statistics

SECURITY RULES:
- You CANNOT approve or reject student payments.
- You CANNOT grant access to protected notes.
- You CANNOT change user roles or passwords.
- If asked to do any prohibited action, politely decline and state that payment and security actions must be handled manually.

When the user asks you to perform an administrative action (e.g. add a class, change a venue, create an assignment), extract the structured parameters and formulate a proposed action for the administrator to confirm.
Be friendly, conversational, and helpful.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: `${systemPrompt}\n\nUser instruction: ${message}` }] }
        ]
      })
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
