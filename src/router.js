import ServersTable from './components/ServersTable.svelte'

import { wrap } from 'svelte-spa-router/wrap'
import RacksTable from "./components/RacksTable.svelte";

export default {
    '/': wrap({ component: ServersTable}),
    '/home': wrap({ component: RacksTable }),
    '*': wrap({ component: ServersTable}),
}
