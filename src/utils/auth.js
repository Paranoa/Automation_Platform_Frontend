import Cookies from 'js-cookie'

const TokenKey = 'auto_test_token'
const RefreshTokenKey = 'auto_test_refresh_token'
const TokenPrepend = 'AUTOTEST '

export function getToken() {
  const token = Cookies.get(TokenKey)
  return token ? `${TokenPrepend}${token}` : ''
}

export function getRefreshToken() {
  const token = Cookies.get(RefreshTokenKey)
  return token ? `${TokenPrepend}${token}` : ''
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function setRefreshToken(token) {
  return Cookies.set(RefreshTokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function removeRefreshToken() {
  return Cookies.remove(RefreshTokenKey)
}
