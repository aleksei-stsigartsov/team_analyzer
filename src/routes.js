import { wrap } from 'svelte-spa-router/wrap'

import Login from './components/views/authentication/sign_in.svelte'
import Register from './components/views/authentication/sign_up.svelte'
import ChangePassword from './components/views/authentication/change_password.svelte'
import MyProfile from './components/views/core/users/my_profile.svelte'
import Overview from './components/views/core/home.svelte'
import EventSchedule from './components/views/core/events/event_schedule.svelte'
import Event from './components/views/core/events/event.svelte'
import NewEvent from './components/views/core/events/add_event.svelte'
import EditEvent from './components/views/core/events/edit_event.svelte'
import Roster from './components/views/core/team/roster.svelte'
import FinancesOverview from './components/views/core/finances/finances_dasboard.svelte'
import NewPayment from './components/views/core/finances/new_payment.svelte'
import EditPaymentRecord from './components/views/core/finances/edit_payment.svelte'
import PaymentRecord from './components/views/core/finances/payment.svelte'
import SubscriptionManagement from './components/views/admin/subscription_dashboard.svelte'
import Subscription from './components/views/admin/subscriptions.svelte'
import UserManagement from './components/views/admin/user_management.svelte'
import User from './components/views/admin/user.svelte'
import Unauthorized from './components/widgets/unathorized.svelte'
import { push } from 'svelte-spa-router'
import { user } from './storage/core_store'
import { get } from 'svelte/store'


const isLoggedIn = async data => {
    // const entra = new Entra()
    // const isValid = await entra.isAuthenticated()
    // if(!get(user).username) await entra.populateUser()
    // if ( ! isValid) push('/login')
    // return isValid
    return true
}


const isAdmin = async data => {
    // const entra = new Entra()
    let isAdmin = true
    // let isAdmin = await entra.isAdmin()
    if ( ! isAdmin) push('/Unauthorized')
    return isAdmin
}

const isSuperAdmin = async data => {
    return true
}

const routes = {
    '/sign-in': wrap({ component: Login }),
    '/sign-up': wrap({ component: Register }),
    '/change-password': wrap({component: ChangePassword, conditions: [isLoggedIn]}),
    '/my-profile': wrap({ component: MyProfile, conditions: [isLoggedIn]}),
    '/': wrap({ component: Overview, conditions: [isLoggedIn]}),
    '/events': wrap({ component: EventSchedule, conditions: [isLoggedIn] }),
    '/add-event': wrap({ component: NewEvent, conditions: [isLoggedIn, isAdmin]}),
    '/edit-event:/id': wrap({component: EditEvent, conditions: [isLoggedIn, isAdmin]}),
    '/event/:id': wrap({ component: Event, conditions: [isLoggedIn] }),
    '/roster': wrap({ component: Roster, conditions: [isLoggedIn]}),
    '/attendance': wrap({ component: AttendaceManagement, conditions: [isLoggedIn] }),
    '/attendance/:id': wrap({ component: Attendace, conditions: [isLoggedIn] }),
    '/finances': wrap({ component: FinancesOverview, conditions: [isLoggedIn] }),
    '/finances/new-payment': wrap({ component: NewPayment, conditions: [isLoggedIn, isAdmin]}),
    '/finances/edit-payment/:id': wrap({ component: EditPaymentRecord, conditions: [isLoggedIn, isAdmin]}),
    '/finances/payment/:id': wrap({ component: PaymentRecord, conditions: [isLoggedIn, isAdmin]}),
    '/admin/subscriptions/': wrap({ component: SubscriptionManagement, conditions: [isLoggedIn, isSuperAdmin] }),
    '/admin/subscription/:id': wrap({ component: Subscription, conditions: [isLoggedIn, isSuperAdmin] }),
    '/admin/users': wrap({ component: UserManagement, conditions: [isLoggedIn, isSuperAdmin] }),
    '/admin/users/:id': wrap({ component: User, conditions: [isLoggedIn, isSuperAdmin] }),
    '/unauthorized': wrap({ component: Unauthorized, conditions: [isLoggedIn] }),
    '*': wrap({ component: Home, conditions: [isLoggedIn] }),
}

export { routes }
