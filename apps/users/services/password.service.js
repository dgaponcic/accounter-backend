import argon2 from 'argon2';

// Hash the password
export async function hashPassword(password) {
	const hashedPassword = await argon2.hash(password);
	return hashedPassword;
}

// Check if user's password matches the input
export async function checkPassword(userPass, inputPass) {
    const match = await argon2.verify(userPass, inputPass);
    return match;
}

export async function resetPassword(user, rawPassword) {
    user.createPassword(rawPassword);
}
