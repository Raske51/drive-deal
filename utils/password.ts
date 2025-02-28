import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const SALT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;
const PEPPER = process.env.PASSWORD_PEPPER;

interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];

  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const hashPassword = async (password: string): Promise<string> => {
  // Add pepper to password before hashing
  const pepperedPassword = `${password}${PEPPER}`;
  
  // Generate salt and hash
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hash = await bcrypt.hash(pepperedPassword, salt);
  
  return hash;
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  // Add pepper to password before verification
  const pepperedPassword = `${password}${PEPPER}`;
  return bcrypt.compare(pepperedPassword, hashedPassword);
};

export const generateResetToken = (): { token: string; hashedToken: string } => {
  // Generate a random token
  const token = crypto.randomBytes(32).toString('hex');
  
  // Hash the token for storage
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  return { token, hashedToken };
};

export const verifyResetToken = (token: string, hashedToken: string): boolean => {
  const hash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  return hash === hashedToken;
};

export const generateTwoFactorSecret = (): string => {
  return crypto.randomBytes(20).toString('hex');
};

// Check if password has been compromised using k-anonymity
export const isPasswordCompromised = async (password: string): Promise<boolean> => {
  const sha1 = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);

  try {
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    const hashes = await response.text();

    return hashes.split('\n').some(line => {
      const [hash, count] = line.split(':');
      return hash === suffix;
    });
  } catch (error) {
    console.error('Error checking password against HaveIBeenPwned:', error);
    return false; // Fail open - allow password if service is unavailable
  }
}; 