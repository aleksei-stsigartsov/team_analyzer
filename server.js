const os = require('os')
const path = require('path')
const fs = require('fs')
const express = require('express')
const app = express()

const status = require('./server/service/status')
const http = require('http')
const compression = require('compression')
const helmet = require('helmet')

const { version } = require('./package.json')
const { getConfigValue } = require('./server/config')
const { connect, Rackwipe, Log, Rack } = require('./server/db')
const Export = require('./controller/export')
const { info } = require('./server/utils')
const { MSG } = require('./server/constants')
const { verify } = require('./server/auth')
const {getType, saveType} = require('./server/service/redis')

const USBDetect = require('./controller/usb-detect')


const server = http.createServer(app)
const io = require('socket.io')(server, { cors: { origin: '*' } })



const room = {
    export: 'export_status'
}

const command = {
    subscribe: 'subscribe',
    unsubscribe: 'unsubscribe',
    testList: 'testList',
}


const APP_PORT = getConfigValue({ value: 'app.port' })
const Site = getConfigValue({ value: 'site' })

const handler = (eventName, ...args) => {
    if (eventName !== 'command') {
        const cb = args.pop()
        Promise.resolve()
            .then(async () => {
                let out = null

                switch (eventName) {
                    case 'users_data':
                    case 'columns':
                        out = Rackwipe[eventName](...args)
                        break
                    case 'ExportData':
                        cb('Export Start')
                        out = Rackwipe[eventName](...args)
                        break
                    case 'distinctHosts':
                    case 'makeFilter':
                    case 'failLogs':
                    case 'getRetentionCount':
                        out = Rackwipe[eventName](...args)
                        break
                    default:
                        throw 'query not found!'
                }

                return out
            })
            .then(cb)
            .catch(err => (console.error(err), cb(err.message || err, false)))
    }

}

//io.use((socket, next) => verify(socket).then(next).catch(err => next(new Error(err))))

io.on('connection', socket => {

    console.info('Client connected...', socket.id)
    let statusData = new status(io, socket.id)
    const commands = {
        [command.subscribe]: async name => {
            const roomName = room[name] || name

            socket.join(roomName)
            return statusData.connectRedis() || {}
        },
        [command.unsubscribe]: async name => {
            const roomName = room[name] || name
            statusData.disconnect()
            socket.leave(roomName)
            Rackwipe['stopExport'](roomName)
            return `Left room: ${ name }`
        },

    }

    socket.on('command', async (cmd, ...args) => {
        const command = commands[cmd]
        const cb = (arg => typeof arg === 'function' ? arg : (args.push(arg), () => null))(args.pop())

        const res = command
            ? typeof command === 'function'
                ? await command(...args).then(res => [true, res]).catch(err => [false, err])
                : [true, command]
            : [false, 'Command not found!']

        console.info(`command: ${ cmd }(${ args }) -> ${ ('' + res[0]).toUpperCase() }: ${ res[1] }`)
        return cb(res)
    })

    socket.onAny(handler)

    socket.on('disconnect', reason => console.info('disconnect:', reason))
})

app.use(express.static(path.join(__dirname, 'public')))

app.get('*', function(req, res){
    res.status(404).send('PAGE NOT FOUND 404')
})
connect()
    .then(_ => server.listen(APP_PORT, _ => {
        new USBDetect(io, false)
        info(MSG.SERVER_STARTED, APP_PORT)
    }))
