import crypto from 'crypto';

// Generate token
export async function generateTokens() {
  const buff = await crypto.randomBytes(30);
  const token = buff.toString('hex');
  return token;
}

// Make an token object available 1 hour
export async function generateTokensObjects(type) {
  const token = await generateTokens();
  const expiresAt = Date.now() + 3600000;
  return {
    type,
    token,
    expiresAt,
	};
}
