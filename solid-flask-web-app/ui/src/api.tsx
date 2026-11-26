import { TranslationKey, TranslationKeys } from './context/LocaleProvider'
import { PaginationResult } from './models/Base'
import { UserAttributes } from './models/User'

interface ErrorData {
  error: number
  message: string
}

export function getErrorMessage(response: ErrorData): TranslationKey {
  return errorMessages[response.error] || 'an_unknown_error_occurred'
}

export type ChangePasswordData = {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

export async function changePassword(data: ChangePasswordData) {
  return post('api/change_password', {
    current_password: data.currentPassword,
    new_password: data.newPassword,
  })
}

export type ForgotPasswordData = {
  email: string
}

export async function forgotPassword(data: ForgotPasswordData) {
  return post('api/forgot_password', {
    email: data.email,
  })
}

export async function getUsers(
  page: number,
  perPage: number
): Promise<PaginationResult<UserAttributes>> {
  const response = await get(`api/users?page=${page}&per_page=${perPage}`)
  if (!response.ok) {
    throw new Error(`Failed to load users (HTTP ${response.status})`)
  }
  return await response.json()
}

export type ResetPasswordData = {
  email: string
  resetToken: string
  newPassword: string
  checkPassword: string
}

export async function resetPassword(data: ResetPasswordData) {
  return post('api/reset_password', {
    email: data.email,
    reset_token: data.resetToken,
    new_password: data.newPassword,
  })
}

export type PasswordLoginData = {
  email: string
  password: string
}

export async function passwordLogin(data: PasswordLoginData) {
  return post('api/login', {
    email: data.email,
    password: data.password,
  })
}

export type TotpLoginData = {
  totpCode: string
  email: string
}

export async function totpLogin(data: TotpLoginData) {
  return post('api/login_2fa', {
    email: data.email,
    totp_code: data.totpCode,
  })
}

export async function logout() {
  return post('api/logout', {})
}

export async function deleteAccount() {
  return _delete('api/delete_account')
}

export type RegisterUserData = {
  email: string
  password: string
  checkPassword: string
}

export async function register(data: RegisterUserData) {
  return post('api/register', {
    email: data.email,
    password: data.password,
  })
}

export async function generate2FASecret() {
  return get('api/generate_2fa_secret')
}

export type Enable2FAData = {
  totpSecret: string
  totpCode: string
}

export async function enable2FA(data: Enable2FAData) {
  return post('api/enable_2fa', {
    totp_secret: data.totpSecret,
    totp_code: data.totpCode,
  })
}

export type Disable2FAData = {
  totpCode: string
}

export async function disable2FA(data: Disable2FAData) {
  return post('api/disable_2fa', {
    totp_code: data.totpCode,
  })
}

export async function verifyEmail(email: string, verificationToken: string) {
  return post('api/verify_email', {
    email: email,
    verification_token: verificationToken,
  })
}

export async function resendVerificationMail() {
  return post('api/resend_email_verification', {})
}

export async function whoAmI() {
  return get('api/whoami')
}

export type CreateUserData = {
  email: string
  password: string
  isAdmin: boolean
}

export async function createUser(data: CreateUserData) {
  return post(`api/users`, {
    email: data.email,
    password: data.password,
    is_admin: data.isAdmin,
  })
}

export type DeleteUserData = {
  userID: number
}

export async function deleteUser(data: DeleteUserData) {
  return _delete(`api/user/${data.userID}`)
}

const CSRF_COOKIE_NAME = 'csrf_token'
const CSRF_HEADER_NAME = 'X-CSRF-Token'

function readCsrfToken(): string | undefined {
  const prefix = `${CSRF_COOKIE_NAME}=`
  const entry = document.cookie.split('; ').find((c) => c.startsWith(prefix))
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : undefined
}

// The API sets the csrf_token cookie on any response. If it is not there yet
// (very first visit), make one cheap GET so a state-changing request can echo it.
async function getCsrfToken(): Promise<string | undefined> {
  let token = readCsrfToken()
  if (!token) {
    await fetch('api/whoami', { credentials: 'same-origin' })
    token = readCsrfToken()
  }
  return token
}

async function unsafeHeaders(): Promise<Headers> {
  const headers = new Headers({ 'Content-Type': 'application/json' })
  const token = await getCsrfToken()
  if (token) {
    headers.set(CSRF_HEADER_NAME, token)
  }
  return headers
}

export async function get(url: string) {
  return fetch(url, {
    method: 'GET',
    headers: new Headers({ 'Content-Type': 'application/json' }),
  })
}

export async function post(url: string, data: object) {
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      ...data,
    }),
    headers: await unsafeHeaders(),
  })
}

export async function _delete(url: string) {
  return fetch(url, {
    method: 'DELETE',
    headers: await unsafeHeaders(),
  })
}

const errorMessages: Record<number, keyof TranslationKeys> = {
  0: 'an_account_with_this_email_already_exists',
  1: 'could_not_login_with_the_given_email_and_password',
  2: 'incorrect_2fa_code_try_again',
  3: 'wrong_password',
  4: 'new_password_does_not_match_conditions',
  5: 'could_not_reset_password_with_the_given_token',
  6: 'this_token_has_expired',
  7: 'could_not_verify_email_with_the_given_token',
  8: 'this_requires_you_to_be_an_admin',
  9: 'twofa_is_already_enabled',
  10: 'incorrect_2fa_code_try_again',
  11: 'twofa_is_already_disabled',
  12: 'user_not_found',
  13: 'an_unknown_error_occurred',
}
