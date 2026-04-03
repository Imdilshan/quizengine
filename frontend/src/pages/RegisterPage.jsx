console.log("REGISTER PAGE LOADED");

import React, { useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("FORM SUBMITTED");

    try {
      const res = await fetch("http://localhost:5001/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      console.log("FULL RESPONSE:", data);
      console.log("TOKEN:", data.token);
      console.log("STATUS:", res.status);

if (!res.ok) {
  alert(data.error || "Registration failed");
  return;
}

if (!data.token) {
  alert("No token received!");
  return;
}

localStorage.setItem("token", data.token);
console.log("TOKEN SAVED:", localStorage.getItem("token"));

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <br /><br />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br /><br />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br /><br />

        <button type="submit">Register</button>
        
      </form>
    </div>
  );
}