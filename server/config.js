const config = require('config')

const { exit } = require('./utils')
const { ERR_MSG } = require('./constants')

const getConfigValue = ({ value, defaultValue }) => {
    if ( ! config.has(value)) {
        if (defaultValue === undefined) exit(ERR_MSG.MISSING_CONFIG_VALUE, value)

        return defaultValue
    }

    return config.get(value)
}

module.exports = {
    getConfigValue
}
