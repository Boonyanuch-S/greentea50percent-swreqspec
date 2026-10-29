// ตรวจวันหมดอายุของ Token ตาม IF-TOKEN-01
export function msUntilExpiry(expiresAt, now = Date.now()) {
  return new Date(expiresAt).getTime() - now
}

export function isTokenExpired(expiresAt, now = Date.now()) {
  return msUntilExpiry(expiresAt, now) <= 0
}
