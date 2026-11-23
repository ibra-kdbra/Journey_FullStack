const MIN_SECRET_LENGTH = 32;

/**
 * The JWT signing secret comes from the environment only. There is no
 * fallback: a default baked into the source would let anyone with the code
 * forge tokens.
 */
export function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < MIN_SECRET_LENGTH) {
        throw new Error(
            `JWT_SECRET must be set to a random value of at least ${MIN_SECRET_LENGTH} characters`,
        );
    }
    return secret;
}

export default {
    expiresIn: "1d",
};
