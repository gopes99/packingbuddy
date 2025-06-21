import { userCredentials } from './keys.js';

function fromUrlSafeBase64(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4 !== 0) str += '=';
  return atob(str);
}

function toUint8Array(base64Str) {
  const binary = atob(base64Str);
  return Uint8Array.from([...binary].map(c => c.charCodeAt(0)));
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

    // Success — enable search
    document.getElementById('authSection').style.display = 'block';
  } catch (err) {
    alert("Face ID failed. Try again.");
  }
});

// Search logic
document.getElementById('searchBox').addEventListener('input', async () => {
  const term = document.getElementById('searchBox').value.toLowerCase().trim();
  const resDiv = document.getElementById('results');
  if (!term || term.length < 2) {
    resDiv.innerHTML = "";
    return;
  }

  const res = await fetch("index.json");
  const data = await res.json();

  const matches = data.filter(entry =>
    entry.id.toLowerCase().includes(term) ||
    entry.label.toLowerCase().includes(term)
  );

  if (!matches.length) {
    resDiv.innerHTML = "<p>No matches found.</p>";
    return;
  }

  resDiv.innerHTML = matches.map(m =>
    `<div class="result">
      <strong>${m.id}</strong><br>
      ${m.label}<br>
      <a href="view.html#${m.hash}">🔗 Open Container</a>
    </div>`
  ).join("");
});
