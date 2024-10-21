import { writable } from 'svelte/store'

const stores = {}

const isLogged = writable(false)

const setValue = (name, value) => {
    if ( ! stores[name]) stores[name] = writable()

    stores[name].set(value)
    localStorage[name] = value
}


export {
    isLogged,
    stores,
    setValue,
}
