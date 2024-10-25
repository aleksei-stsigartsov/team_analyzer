import { writable } from 'svelte/store'

export const stores = {}

export const setValue = (name, value) => {
    if ( ! stores[name]) stores[name] = writable()

    stores[name].set(value)
    localStorage[name] = value
}


