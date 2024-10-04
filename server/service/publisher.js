const config = require('config')

const redisConf = config.has('redis') ? config.get('redis') : {}
const redis = new (require('ioredis'))(Object.assign({ showFriendlyErrorStack: true }, redisConf))

const publish = ({ channel, msg }) => redis.publish(channel, typeof msg === 'object' ? JSON.stringify(msg) : msg)

module.exports = {
    publish
}
