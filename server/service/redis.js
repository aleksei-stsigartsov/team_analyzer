const config = require('config')
const redisConf = config.has('redis') ? config.get('redis') : {}
const redis = new (require('ioredis'))(Object.assign({ showFriendlyErrorStack: true }, redisConf))

const saveKey = async (data) => {
    return redis.set(data.key, data.value)
}

const getByKey = async (key) => {
    let data = await redis.get(key)
    return data
}

module.exports = {
    saveType,
    getType
}
