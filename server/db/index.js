const mongoose = require('mongoose')

const Rackwipe = require('./model/Rackwipe')
const Rack = require('./model/Rack')
const Hdd = require('./model/Hdd')
const Txt = require('./model/Txt')
const Log = require('./model/Log')
const { exit } = require('../utils')
const { ERR_MSG, MSG } = require('../constants')
const { getConfigValue } = require('../config')

const uri = getConfigValue({ value: 'database.uri' })

const connect = _ =>
    mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .then(_ => (console.info(MSG.DB_CONNECTED), true))
        .catch(err => exit(ERR_MSG.DB_CONNECTING, err.message))

module.exports = {
    connect,
    Rackwipe,
    Log,
    Rack,
    Hdd,
    Txt

}
