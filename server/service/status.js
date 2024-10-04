const config = require('config')
const redisConf = config.has('redis') ? config.get('redis') : {}
const redisI0 = require('ioredis')
const redisFullConf = Object.assign({ showFriendlyErrorStack: true }, redisConf)

const room = {
    export_status: 'export_status'
}


class status {
    constructor(io, id) {
        this.io = io
        this.id = id
        this._error_status = {}
        this.redis = ''
    }
    disconnect() {
        console.log('Disconnect redis')
        this.redis.disconnect(false)
    }

    connectRedis() {
        this.redis = new redisI0(redisFullConf)
        this.redis.subscribe(this.id, (err) => {
            if (err) console.error(err)
            else {
                console.log('subscribed to redis!')
                this.redis.on('message', (channel, msg) => {
                    const json = JSON.parse(msg)
                    this.io.to(channel).emit(channel, this[channel] = json)
                })
            }
        })
    }

    get error_status() {
        return this._error_status
    }

    set error_status(val) {
        this._error_status =  val
    }

}

module.exports = status
