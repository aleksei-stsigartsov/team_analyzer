// Overrides
if ( ! String.prototype.format) {
    String.prototype.format = function() {
        return this.replace(/{(\d+)}/g, (match, number) => typeof arguments[number] !== 'undefined'
            ? arguments[number]
            : match
        )
    }
}

const exit = (msg, ...vals) => {
    console.error(msg.format(...vals))
    process.exit(1)
}

const info = (msg, ...vals) => {
    console.info(msg.format(...vals))
}
const error = (msg, ...vals) => console.error(msg.format(...vals))


module.exports = {
    exit,
    info,
    error,
}
