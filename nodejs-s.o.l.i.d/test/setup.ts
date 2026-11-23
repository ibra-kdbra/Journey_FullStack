// Imported first by the tests so the configuration is in place before
// src/helpers/EnvConfig reads process.env.
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-only-secret'
process.env.ADMIN_USER_IDS = '1'
process.env.SALT_ROUNDS = '4'
process.env.BCRYPT_PASSWORD = 'pepper'
