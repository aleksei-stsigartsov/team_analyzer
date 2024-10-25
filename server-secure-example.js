const path = require('path')
const express = require('express')
const app = express()
const cors = require('cors')
const { getConfigValue, info } = require('./utils')
const https = require('https')
const { verify } = require('./server/authentication')
const compression = require('compression')
const { connect, model, Log } = require('./db')
const { S3 } = require('./controller/s3')
const { Entra } = require('./controller/Entra')
const helmet = require('helmet')
const { MSG } = require('./constants')
const bodyParser = require('body-parser')
const { hostname } = require('os')
const namespace = 'global_eng_portal'
const fs = require('fs')
const port = getConfigValue({ value: `${ namespace }.port`, defaultValue: 1339 })
const certPath = getConfigValue({ value: 'certPath' })
const keyPath = getConfigValue({ value: 'keyPath' })

certfile = fs.readFileSync(certPath)
keyfile = fs.readFileSync(keyPath)

const secureserver = https.createServer({ cert: certfile, key: keyfile }, app)
const io = require('socket.io')(secureserver, { cors: { origin: '*' }, maxHttpBufferSize: 100e8, pingInterval: 60000, pingTimeout: 999999 })

io.use((socket, next) => verify(socket).then(next).catch(err => next(new Error(err))))
io.engine.use(helmet({
    contentSecurityPolicy: {
        directives: {
            "default-src": ["'self'"],
            "script-src": ["'self'", "'unsafe-inline'", "https://alcdn.msauth.net"],
            "style-src": ["'self'", "'unsafe-inline'", "https://alcdn.msauth.net"],
            "img-src": ["'self'", "data:"],
            "connect-src": ["'self'", 'https://login.microsoftonline.com','https://graph.microsoft.com'],
            "frame-src": ["'self'", "https://login.microsoftonline.com"],
        },
        "Server": false
    },
}))

let adminQuery = ['addOptions', 'addConfigs', 'deleteConfigs', 'getLastLogin', 'getUsers', 'getAllUsers', 'editUserRole', 'assignAppRoleToUser']
let contributorQuery = ['saveDoc']
let ownerQuery = ['updateDoc', 'getMyDocs']

const handler = async (io, socket, action, event, ...args) => {
    const cb = args.pop()
    if (adminQuery.includes(event) && ! socket.role.includes('ADMIN')) {
        return cb('Not allowed!', false)
    }
    if (contributorQuery.includes(event)) {
        if ( ! socket.role.includes('ADMIN') && ! socket.role.includes('CONTRIBUTOR')) {
            return cb('Not allowed!', false)
        }
    }

    if (ownerQuery.includes(event) && socket.oid !== args[1].oid) {
        return cb('Not allowed!', false)
    }

    Object.assign(args[0], { socket: socket }, { io: io })

    const isModel = model[action]
    if (isModel) {
        const queryId = args.shift()
        const isEvent = model[action][event]

        if (isEvent) {
            try {
                const data = await model[action][event](...args)
                data.queryId = queryId
                cb(data)
            } catch (err) {
                //console.error(err)
                cb(err.message || err, false)
            }

        } else {
            cb('query not found', false)
        }
    } else {
        const queryId = args.shift()

        switch (action) {
            case 'S3':
                try {
                    let res = await S3[event](...args, socket, io)
                    cb(res)
                } catch (err) {
                    console.log(err)
                    cb(err, false)
                }
                break
            case 'Entra':
                try {
                    let res = await Entra[event](...args)
                    cb(res)
                } catch (err) {
                    cb(err, false)
                }
                break
        }
        cb('unknown request', false)
    }

}
io.on('connection', async socket => {
    console.info('Client connected...', socket.id)

    socket.join(socket.id)

    socket.onAny((...req) => handler(io, socket, ...req).catch(console.error))

    socket.on('disconnect', reason => console.info('disconnect:', reason))

})

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                "default-src": ["'self'"],
                "script-src": ["'self'", "'unsafe-inline'", "https://alcdn.msauth.net"],
                "style-src": ["'self'", "'unsafe-inline'", "https://alcdn.msauth.net"],
                "img-src": ["'self'", "data:"],
                "connect-src": ["'self'", 'https://login.microsoftonline.com','https://graph.microsoft.com', "blob:"],
                "frame-src": ["'self'", "https://login.microsoftonline.com", "blob:"],
                "object-src": ["'self'", "blob:"]
            },
        },
        crossOriginOpenerPolicy: false,
        "Server": false
    }),
    compression({ filter: false, level: 0 }),
    express.static(path.join(__dirname, 'UI/dist')),
    cors()
)
app.use(bodyParser.json({ limit: '10mb' }))


secureserver.listen(port, _ => {
    info(MSG.SERVER_LISTENING, port)
})
