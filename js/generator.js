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

    // Step 2: Create payload and base64 encode it
    const jsonPayload = JSON.stringify({ id, ciphertext });
    const encoded = toUrlSafeBase64(jsonPayload);

    // Step 3: Construct the view.html link
    const basePath = location.pathname.endsWith('index.html') || location.pathname.endsWith('/')
      ? location.pathname.replace(/index\.html$/, '').replace(/\/$/, '')
      : location.pathname;

    const qrUrl = `${location.origin}${basePath}/view.html#${encoded}`;
    console.log("✅ QR will contain:", qrUrl);

    // Step 4: Generate QR code
    const canvas = document.getElementById('qr');
    await QRCode.toCanvas(canvas, qrUrl, {
      width: 300,
      errorCorrectionLevel: 'H'
    });

    // Step 5: Auto-download PNG
    const link = document.createElement('a');
    link.download = `${id}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    // ✅ Step 7: Output index.json entry
    const indexEntry = {
      id,
      label: contents,
      hash: encoded
    };

    // Step 6: Show label
    document.getElementById('label').innerText = `Container ID: ${id} <br/> ${indexEntry}`;

    console.log("⬇️ Copy and paste this into index.json:");
    console.log(JSON.stringify(indexEntry, null, 2));

  } catch (err) {
    console.error("❌ Encryption or QR generation failed:", err);
    alert("Something went wrong.");
  }
});
