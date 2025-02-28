import crypto from 'crypto';
import { promisify } from 'util';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

interface EncryptedData {
  encrypted: Buffer;
  iv: Buffer;
  tag: Buffer;
  salt: Buffer;
}

interface EncryptionResult {
  encryptedData: string; // Base64 encoded
  metadata: {
    iv: string;
    tag: string;
    salt: string;
  };
}

const pbkdf2Async = promisify(crypto.pbkdf2);

export const generateEncryptionKey = async (password: string, salt: Buffer): Promise<Buffer> => {
  return pbkdf2Async(password, salt, ITERATIONS, KEY_LENGTH, 'sha256');
};

export const encrypt = async (data: Buffer | string, password: string): Promise<EncryptionResult> => {
  // Generate a random salt
  const salt = crypto.randomBytes(SALT_LENGTH);
  
  // Generate key from password
  const key = await generateEncryptionKey(password, salt);
  
  // Generate random IV
  const iv = crypto.randomBytes(IV_LENGTH);
  
  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  // Convert data to Buffer if it's a string
  const dataBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
  
  // Encrypt data
  const encrypted = Buffer.concat([
    cipher.update(dataBuffer),
    cipher.final()
  ]);
  
  // Get authentication tag
  const tag = cipher.getAuthTag();
  
  return {
    encryptedData: encrypted.toString('base64'),
    metadata: {
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
      salt: salt.toString('base64')
    }
  };
};

export const decrypt = async (
  encryptedResult: EncryptionResult,
  password: string
): Promise<Buffer> => {
  // Convert base64 strings back to Buffers
  const encrypted = Buffer.from(encryptedResult.encryptedData, 'base64');
  const iv = Buffer.from(encryptedResult.metadata.iv, 'base64');
  const tag = Buffer.from(encryptedResult.metadata.tag, 'base64');
  const salt = Buffer.from(encryptedResult.metadata.salt, 'base64');
  
  // Generate key from password and salt
  const key = await generateEncryptionKey(password, salt);
  
  // Create decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  // Decrypt data
  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);
};

export const hashData = (data: string): string => {
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex');
};

export const generateSecureKey = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Encrypt sensitive data fields in an object
export const encryptSensitiveData = async <T extends { [key: string]: any }>(
  data: T,
  sensitiveFields: Array<keyof T>,
  encryptionKey: string
): Promise<T> => {
  const encryptedData = { ...data };

  for (const field of sensitiveFields) {
    if (data[field] && typeof data[field] === 'string') {
      const encrypted = await encrypt(data[field] as string, encryptionKey);
      encryptedData[field] = JSON.stringify(encrypted) as any;
    }
  }

  return encryptedData;
};

// Decrypt sensitive data fields in an object
export const decryptSensitiveData = async <T extends { [key: string]: any }>(
  data: T,
  sensitiveFields: Array<keyof T>,
  encryptionKey: string
): Promise<T> => {
  const decryptedData = { ...data };

  for (const field of sensitiveFields) {
    if (data[field] && typeof data[field] === 'string') {
      const encrypted = JSON.parse(data[field] as string);
      const decrypted = await decrypt(encrypted, encryptionKey);
      decryptedData[field] = decrypted.toString() as any;
    }
  }

  return decryptedData;
}; 