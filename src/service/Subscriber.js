import { get, readable } from 'svelte/store'

const command = {
    subscribe: 'subscribe',
    unsubscribe: 'unsubscribe',

}

export default class Subscriber {
    constructor(props) {
        this.connection = props.connection
        this.room = props.room
        this.updater = props.updater
        this.subscribed = false

        this._data = readable( {}, set => {
            this.room = get(this.connection).id
            const sendCommand = () => get(this.connection).emit('command', command.subscribe, this.room, (response) => {
                if (response[0]) {
                    console.info('Subscribed to:', this.room)
                    set(response[1])
                }

                get(this.connection).on(this.room, data => {
                    if (this.updater) {
                        const storeData = get(this.data)
                        this.updater(storeData, data)
                        set(storeData)
                    } else set(data)
                })
            })

            const unsub = this.connection.subscribe(connection => {
                if ( ! connection) return this.subscribed = false
                if (this.subscribed) return

                this.subscribed = true // TODO: check acknowledgement of actual command response?
                sendCommand()
            })

            return () => {
                unsub()
                this.subscribed = false

                const connection = get(this.connection)
                if (connection) {
                    connection.off(this.room)
                    connection.emit('command', command.unsubscribe, this.room, response => {
                        if (response) {
                            console.info('Unsubscribed from:', this.room)
                            set([])
                        } else console.error('Failed to unsubscribe from:', this.room)

                    })
                }
            }
        })

    }

    get data() { return this._data }
}
