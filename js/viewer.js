import { userCredentials } from './keys.js';
import { decryptText } from './crypto.js';

function fromUrlSafeBase64(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4 !== 0) str += '=';
  return atob(str);
}

function toUint8Array(base64Str) {
  const binary = atob(base64Str);
  return Uint8Array.from([...binary].map(c => c.charCodeAt(0)));
}

const hash = location.hash.substring(1);
if (!hash) {
  document.getElementById('result').textContent = "No QR payload found.";
  document.getElementById('proceed').disabled = true;
}

// Populate dropdown
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
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [allowCredential],
        userVerification: "required",
        timeout: 60000
      }
    });

    // Auth success, now decode payload
    const json = JSON.parse(fromUrlSafeBase64(hash));
    const decrypted = await decryptText(json.ciphertext);
    document.getElementById('result').textContent =
      `✅ Container ID: ${json.id}\n📦 Contents: ${decrypted}`;
  } catch (err) {
    alert("Face ID failed or canceled. Returning to user select.");
    location.reload();
  }
});
