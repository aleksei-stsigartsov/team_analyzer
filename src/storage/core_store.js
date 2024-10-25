import { writable } from 'svelte/store'

export const alert = writable({
    msg: '',
    type: '', //1 for error, 0 for success
})

export const user = writable({
    username: '',
    email: '',
    token: null,
    oid: null,
    newPassword: '',
    verifyCode: '',
    roles: [],
})

export const isLogged = writable(false)

export const darkMode = writable(false);