import io from 'socket.io-client'
import { getToken } from '@/utils/auth'

export default function(config) {
  const url = process.env.VUE_APP_SOCKET_URL
  const socket = io(url, {
    transports: ['polling', 'websocket'],
    transportOptions: {
      polling: {
        extraHeaders: {
          'AUTHORIZATION': getToken()
        }
      }
    }
  })
  const { listeners } = config
  Object.keys(listeners).forEach(key => {
    const value = listeners[key]
    socket.on(key, value)
  })
  return socket
}
