"use client";

import { useActionState } from "react";
import { submitForm } from "./actions";

const initialState = { error: "", greeting: "" };

export default function Form() {
  const [state, formAction, isPending] = useActionState(
    submitForm,
    initialState,
  );

  return (
    <form action={formAction}>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required />
      </div>
      <div>
        <label htmlFor="firstName">First name</label>
        <input id="firstName" name="firstName" type="text" required />
      </div>
      <div>
        <label htmlFor="lastName">Last name</label>
        <input id="lastName" name="lastName" type="text" required />
      </div>
      <button type="submit" disabled={isPending}>
        {isPending ? "Submitting..." : "Submit"}
      </button>
      {state.error && <p role="alert">{state.error}</p>}
      {state.greeting && (
        <div role="status">
          <p>Thanks for submitting!</p>
          <p>{state.greeting}</p>
        </div>
      )}
    </form>
  );
}
