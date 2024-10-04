const events = {}

const emit = (name, ...args) => (events[name] || []).forEach(fn => fn(...args))
const on = (name, cb) => (events[name] || (events[name] = [])).push(cb)

export default {
    emit,
    on
}
