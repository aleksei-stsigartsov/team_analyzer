const jwt = require('jsonwebtoken')
const { getConfigValue } = require('./config')
const { DateTime } = require('luxon')
const jwkToPem = require('jwk-to-pem')
const keys = getConfigValue({ value: 'authKeys' })
const gracePeriod = 10

const ROLE = { USER: 'USER'}

const verify = async socket => {
    const token = socket?.handshake?.auth?.token

    if ( ! token) throw 'Token not included!'

    let error = null

    for (const key of keys) {
        const pem = jwkToPem(key)
        jwt.verify(token, pem, (err, user) => {
            if (err) return error = err.message

            error = ''

            // TODO: is this step necessary ?
            if (DateTime.fromSeconds(user.exp) < DateTime.now().plus({ seconds: gracePeriod })) return error = 'Token expired'

            socket.role = user['cognito:groups'] ? user['cognito:groups'][0] : ROLE.USER
        })

        if (socket.role) break
    }

    if (error) {
        console.error('auth error:', error.message || error)
        throw error.message || error
    }

}

module.exports = {
    verify
}
