import { encryptText } from './crypto.js';

function toUrlSafeBase64(str) {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

document.getElementById('generate').addEventListener('click', async () => {
  const id = document.getElementById('container_id').value.trim();
  const contents = document.getElementById('contents').value.trim();

  if (!id || !contents) {
    alert("Please fill in both Container ID and Contents.");
    return;
  }

  try {
    // Step 1: Encrypt contents
    const ciphertext = await encryptText(contents);

    // Step 2: Create object and encode
    const jsonPayload = JSON.stringify({ id, ciphertext });
    const encoded = toUrlSafeBase64(jsonPayload);

    // Step 3: Form URL for view.html
  const basePath = location.pathname.endsWith('index.html') || location.pathname.endsWith('/') ? location.pathname.replace(/index\.html$/, '').replace(/\/$/, '') : location.pathname;

const qrUrl = `${location.origin}${basePath}/view.html#${encoded}`;
    console.log("QR will contain:", qrUrl); // For debug

    // Step 4: Generate QR to canvas
    const canvas = document.getElementById('qr');
    await QRCode.toCanvas(canvas, qrUrl, {
      width: 300,
      errorCorrectionLevel: 'H'
    });

    // Step 5: Auto-download QR
    const link = document.createElement('a');
    link.download = `${id}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    // Step 6: Show label
    document.getElementById('label').innerText = `Container ID: ${id}`;
  } catch (err) {
    console.error("Encryption or QR generation failed:", err);
    alert("Something went wrong.");
  }
});
