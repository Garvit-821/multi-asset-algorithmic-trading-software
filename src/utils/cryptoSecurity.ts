// Web Crypto API utility for AES-GCM 256-bit encryption of exchange API keys

const SALT = new Uint8Array([142, 85, 23, 99, 102, 11, 88, 201, 45, 12, 90, 115, 33, 44, 55, 66]);
const STORAGE_KEY = 'cryptoagent_encrypted_exchange_keys';

export interface SavedExchangeCredentials {
  encrypted: string; // Base64 JSON of iv + ciphertext
  updatedAt: string;
}

// Derive AES-GCM CryptoKey from user passphrase
async function deriveKey(passphrase: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: SALT,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt payload object with passphrase
export async function encryptData<T>(data: T, passphrase: string): Promise<string> {
  const key = await deriveKey(passphrase);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const encodedData = enc.encode(JSON.stringify(data));

  const encryptedContent = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encodedData
  );

  const payload = {
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(encryptedContent)),
  };

  return btoa(JSON.stringify(payload));
}

// Decrypt base64 string with passphrase
export async function decryptData<T>(encryptedBase64: string, passphrase: string): Promise<T> {
  try {
    const payload = JSON.parse(atob(encryptedBase64));
    const iv = new Uint8Array(payload.iv);
    const data = new Uint8Array(payload.data);

    const key = await deriveKey(passphrase);

    const decryptedContent = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      data
    );

    const dec = new TextDecoder();
    return JSON.parse(dec.decode(decryptedContent)) as T;
  } catch (_error) {
    throw new Error('Invalid passphrase or corrupted encrypted credentials');
  }
}

// Save encrypted credentials to localStorage
export async function saveEncryptedCredentials<T>(credentials: T, passphrase: string): Promise<void> {
  const encrypted = await encryptData(credentials, passphrase);
  const record: SavedExchangeCredentials = {
    encrypted,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

// Load and decrypt credentials from localStorage
export async function loadDecryptedCredentials<T>(passphrase: string): Promise<T | null> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  const record: SavedExchangeCredentials = JSON.parse(raw);
  return await decryptData<T>(record.encrypted, passphrase);
}

// Check if encrypted credentials exist in storage
export function hasStoredCredentials(): boolean {
  return !!localStorage.getItem(STORAGE_KEY);
}

// Clear stored credentials
export function clearStoredCredentials(): void {
  localStorage.removeItem(STORAGE_KEY);
}
