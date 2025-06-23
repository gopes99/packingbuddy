import { userCredentials } from './keys.js';

function toUint8Array(base64Str) {
  const binary = atob(base64Str);
  return Uint8Array.from([...binary].map(c => c.charCodeAt(0)));
}

const hash = decodeURIComponent(location.hash.substring(1));
if (!hash) {
  document.getElementById('result').textContent = "No container ID found in URL.";
  document.getElementById('proceed').disabled = true;
}

// Populate user dropdown
const dropdown = document.getElementById('userSelect');
Object.keys(userCredentials).forEach(username => {
  const opt = document.createElement("option");
  opt.value = username;
  opt.textContent = username;
  dropdown.appendChild(opt);
});

document.getElementById('proceed').addEventListener('click', async () => {
  const username = dropdown.value;
  const base64id = userCredentials[username];
  const allowCredential = {
    type: "public-key",
    id: toUint8Array(base64id),
    transports: ["internal"]
  };

  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);

  try {
    await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [allowCredential],
        userVerification: "required",
        timeout: 60000
      }
    });

    // Auth success → fetch index.json and lookup
    const res = await fetch("index.json");
    const data = await res.json();

    const found = data.find(entry => entry.id === hash);
    if (!found) {
      document.getElementById('result').textContent = "Container not found.";
      return;
    }

    document.getElementById('result').textContent =
      `✅ Container ID: ${found.id}\n📦 Contents: ${found.label}`;

  } catch (err) {
    alert("Face ID failed or cancelled.");
  }
});
