function base64urlEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

document.getElementById("register").addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  if (!username) {
    alert("Username is required");
    return;
  }

  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);

  try {
    const publicKey = {
      challenge,
      rp: { name: "Secure QR App" },
      user: {
        id: new Uint8Array(16),
        name: username,
        displayName: username
      },
      pubKeyCredParams: [{ alg: -7, type: "public-key" }],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required"
      },
      timeout: 60000,
      attestation: "none"
    };

    const cred = await navigator.credentials.create({ publicKey });
    const encodedId = base64urlEncode(cred.rawId);

    document.getElementById("output").textContent =
      `"${username}": "${encodedId}",`;

    alert("Registration complete. Paste the shown line into keys.js");
  } catch (err) {
    console.error(err);
    alert("Registration failed.");
  }
});
