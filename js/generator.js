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
    const ciphertext = await encryptText(contents);
    const jsonPayload = JSON.stringify({ id, ciphertext });
    const encoded = toUrlSafeBase64(jsonPayload);

    const basePath = location.pathname.endsWith('index.html') || location.pathname.endsWith('/')
      ? location.pathname.replace(/index\.html$/, '').replace(/\/$/, '')
      : location.pathname;

    const qrUrl = `${location.origin}${basePath}/view.html#${encoded}`;

    const canvas = document.getElementById('qr');
    await QRCode.toCanvas(canvas, qrUrl, {
      width: 300,
      errorCorrectionLevel: 'H'
    });

    const link = document.createElement('a');
    link.download = `${id}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    // Show container ID
    document.getElementById('label').innerText = `Container ID: ${id}`;

    // Show index.json block
    const jsonBlock = {
      id,
      label: contents,
      hash: encoded
    };
    const jsonDiv = document.getElementById('json-output');
    jsonDiv.innerText = JSON.stringify(jsonBlock, null, 2);
  } catch (err) {
    console.error("Encryption or QR generation failed:", err);
    alert("Something went wrong.");
  }
});
