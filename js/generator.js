document.getElementById('generate').addEventListener('click', async () => {
  const id = document.getElementById('container_id').value.trim();
  const contents = document.getElementById('contents').value.trim();

  if (!id || !contents) {
    alert("Please fill in both Container ID and Contents.");
    return;
  }

  try {
    // Step 1: Form URL using only Box ID
    const basePath = location.pathname.endsWith('index.html') || location.pathname.endsWith('/')
      ? location.pathname.replace(/index\.html$/, '').replace(/\/$/, '')
      : location.pathname;

    const qrUrl = `${location.origin}${basePath}/view.html#${id}`;
    console.log("QR will contain:", qrUrl);

    // Step 2: Generate QR code
    const canvas = document.getElementById('qr');
    await QRCode.toCanvas(canvas, qrUrl, {
      width: 300,
      errorCorrectionLevel: 'H'
    });

    // Step 3: Auto-download
    const link = document.createElement('a');
    link.download = `${id}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    // Step 4: Show label
    document.getElementById('label').innerText = `Container ID: ${id}`;

    // Step 5: Output for index.json
    const entry = {
      id,
      label: contents
    };
    document.getElementById('json-output').innerText = JSON.stringify(entry, null, 2);
  } catch (err) {
    console.error("QR generation failed:", err);
    alert("Something went wrong.");
  }
});
