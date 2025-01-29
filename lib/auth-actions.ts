"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    // console.log("Error: ", error);
    throw new Error("Invalid email or password.");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const firstName = formData.get("first-name") as string;
  const lastName = formData.get("last-name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const data = {
    email,
    password,
    options: {
      data: {
        full_name: `${firstName} ${lastName}`,
        email,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
    },
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    throw new Error("An error occurred while creating your account.");
  }

  revalidatePath("/", "layout");
}

export async function signout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    // console.log(error);
    redirect("/error");
  }

  redirect(`${process.env.NEXT_PUBLIC_APP_URL}/logout`);
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });

  if (error) {
    // console.log(error);
    redirect("/error");
  }

  redirect(data.url);
}

export async function forgotPassword(formData: FormData) {
  const email = formData.get("email") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  });

  if (error) {
    throw new Error(
      "An error occurred while attempting to reset your password."
    );
  }
}

export async function resetPassword(
  formData: FormData,
  searchParams: { code?: string }
) {
  const password = formData.get("password") as string;
  const supabase = await createClient();

  if (searchParams.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(
      searchParams.code
    );

    if (error) {
      return redirect(
        `/reset-password?message=Unable to reset Password. Link expired!`
      );
    }
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    // console.log(error);
    return redirect(
      `/reset-password?message=Unable to reset Password. Try again!`
    );
  }
}
