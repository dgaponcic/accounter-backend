import crypto from 'crypto';

async function generateTokens() {
    console.log('here');
    const buff = await crypto.randomBytes(30);
    const token = buff.toString('hex');
    return token;
}

export default generateTokens;
