const keyHex = "8f94c1a39108aef0af7c52e68c4dd512"; // Example hex key — change yours!
const keyBytes = new Uint8Array(keyHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
const keyPromise = crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["encrypt", "decrypt"]);

export async function encryptText(plainText) {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await keyPromise;
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plainText));
  return btoa(JSON.stringify({ iv: Array.from(iv), data: Array.from(new Uint8Array(encrypted)) }));
}

export async function decryptText(cipherB64) {
  const { iv, data } = JSON.parse(atob(cipherB64));
  const key = await keyPromise;
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(iv) }, key, new Uint8Array(data));
  return new TextDecoder().decode(decrypted);
}
