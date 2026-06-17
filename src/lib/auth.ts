"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import type { Session, User } from "@supabase/supabase-js";

export async function getSession(): Promise<Session | null> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    await supabase.auth.signOut();
    return null;
  }
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function requireUser(): Promise<User> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");
  return user;
}

export async function signIn(email: string, password: string): Promise<string | null> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return error.message;
  return null;
}

export async function signUp(name: string, email: string, password: string): Promise<string | null> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: name } },
  });
  if (error) return error.message;
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) return signInError.message;
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
