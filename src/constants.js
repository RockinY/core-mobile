// const baseUrl = '192.168.31.112:3000'
const baseUrl = 'dev.krae.cn'
const isSecure = 's'

export const REACT_APP_WS_URI=`ws${isSecure}://${baseUrl}/websocket`

export const REACT_APP_API_URI=`http${isSecure}://${baseUrl}/api`

export const REACT_APP_SERVER_URL=`http${isSecure}://${baseUrl}`

export const REACT_APP_CLIENT_URL=`http${isSecure}://${baseUrl}`