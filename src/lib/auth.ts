"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBrand } from "@/lib/brand";

import type { User } from "@supabase/supabase-js";

export async function getToken(): Promise<string | null> {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export async function getUser(): Promise<User | null> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  return user;
}

export async function requireUser(): Promise<User> {
  const user = await getUser();

  if (!user) redirect("/sign-in");

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

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${getBrand().url}/sign-in?email=${encodeURIComponent(email)}`,
    },
  });

  if (error) return error.message || JSON.stringify(error);
  if (data.user?.identities?.length === 0) return "An account with this email already exists.";

  return null;
}

export async function requestPasswordReset(email: string): Promise<string | null> {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getBrand().url}/reset-password`,
  });

  if (error) return error.message;

  return null;
}

export async function resetWithCode(code: string, password: string): Promise<string | null> {
  const supabase = await createClient();

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) return exchangeError.message;

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    await supabase.auth.signOut();
    return error.message;
  }

  return null;
}

export async function signOut() {
  const supabase = await createClient();

  await supabase.auth.signOut();
}
