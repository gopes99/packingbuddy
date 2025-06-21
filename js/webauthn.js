import { allowedCredentialIDs } from './keys.js';

export async function register() {
  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: { name: "Secure QR Viewer" },
      user: {
        id: new Uint8Array(16),
        name: "user@example.com",
        displayName: "User"
      },
      pubKeyCredParams: [{ type: "public-key", alg: -7 }],
      authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
      timeout: 60000,
      attestation: "none"
    }
  });
  return btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
}

export async function authenticate() {
  const allow = allowedCredentialIDs.map(id => ({
    id: Uint8Array.from(atob(id), c => c.charCodeAt(0)).buffer,
    type: "public-key",
    transports: ["internal"]
  }));
  await navigator.credentials.get({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      allowCredentials: allow,
      timeout: 60000,
      userVerification: "required"
    }
  });
}