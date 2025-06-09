const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;

// Convert the encryption key to a CryptoKey
async function getCryptoKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(ENCRYPTION_KEY);

  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encrypt(text: string): Promise<string> {
  const key = await getCryptoKey();
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  // Generate a random initialization vector
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt the data
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    data,
  );

  // Combine the IV and encrypted data
  const encryptedArray = new Uint8Array(iv.length + encryptedData.byteLength);
  encryptedArray.set(iv);
  encryptedArray.set(new Uint8Array(encryptedData), iv.length);

  // Convert to base64 for storage
  return btoa(String.fromCharCode(...encryptedArray));
}

export async function decrypt(encryptedText: string): Promise<string> {
  const key = await getCryptoKey();

  // Convert from base64
  const encryptedArray = new Uint8Array(
    atob(encryptedText)
      .split("")
      .map((char) => char.charCodeAt(0)),
  );

  // Extract the IV (first 12 bytes)
  const iv = encryptedArray.slice(0, 12);
  const data = encryptedArray.slice(12);

  // Decrypt the data
  const decryptedData = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    data,
  );

  // Convert back to string
  const decoder = new TextDecoder();
  return decoder.decode(decryptedData);
}
