const config = require('config')
const redisConf = config.has('redis') ? config.get('redis') : {}
const redis = new (require('ioredis'))(Object.assign({ showFriendlyErrorStack: true }, redisConf))


const saveType = async (data) => {
    return redis.set('pc_type', data)
}

const getType = async () => {
    let data = await redis.get('pc_type')
    return data
}

module.exports = {
    saveType,
    getType
}
