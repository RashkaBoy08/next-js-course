"use server";

type FormState = {
  error: string;
  greeting: string;
};

export async function submitForm(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = formData.get("email");
  const password = formData.get("password");
  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof firstName !== "string" ||
    typeof lastName !== "string" ||
    !email.trim() ||
    !firstName.trim() ||
    !lastName.trim()
  ) {
    return { error: "Please fill out all fields.", greeting: "" };
  }

  if (password.length < 6) {
    return {
      error: "Password must be at least 6 characters long.",
      greeting: "",
    };
  }

  console.log("Submitted email:", email.trim());

  return {
    error: "",
    greeting: `Hello, ${firstName.trim()} ${lastName.trim()}!`,
  };
}
