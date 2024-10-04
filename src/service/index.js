import { io } from 'socket.io-client'
import { get, writable } from 'svelte/store'
import Subscriber from './Subscriber'

const room = {
    export_status: 'export_status'
}

const connection = writable(0)
let socket = null
const connect = token => {
    if (get(connection) === 0) {
        console.log('main service connect...')

        socket = io(window.location.origin)
        socket.on('connect', _ => (console.info('connected'), connection.set(socket)))
        socket.on('disconnect', reason => (console.info('disconnected:', reason), connection.set(0)))
        socket.on('connect_error', err => console.error('connection error:', err.message || err))
    }
}

connect()

const conPromise = { promise: null }
const waitCon = async _ => get(connection) || conPromise.promise || (conPromise.promise = new Promise(ok => {
    const unsub = connection.subscribe(val => val && (conPromise.promise = null, unsub(), ok()))
}))

const query = (...args) => waitCon().then(_ => new Promise((ok, err) =>
    get(connection).emit(...args, (data, result = true) => result ? ok(data) : err(data))
))

const export_statusTest = new Subscriber( {

    connection, room: 'export' , updater: (store, data) => {

        store['data'] = []
        store['data'] = data['data']
    }
}).data

export {
    query,
    export_statusTest,
    connection,
    socket
}
