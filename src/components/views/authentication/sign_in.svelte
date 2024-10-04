<script>

    import SignIn from '../SignIn.svelte'
	import Entra from '../../entra/index.js'
    import { pop, push } from 'svelte-spa-router'
    import { alert, user } from '../../store.js'
    import { query } from '../../service/index.js'
    import { onMount } from 'svelte'
    const entra = new Entra()


    onMount(async () => {

    })


    let title = 'Sign in with Microsoft account'
    let site = {
        name: 'Global Engineering',
        img: '/logo.png',
        link: '/',
        imgAlt: 'FlowBite Logo'
    }

    let loginTitle = 'Login'


    const showAlert = (msg, type, timeout) => {
        $alert.msg = msg
        $alert.type = type
        setTimeout(() => {
            $alert.msg = ''
            $alert.type = ''
        }, timeout)
    }


    const load = async (model, name, params) => {
        let queryId = Date.now()
        return await query(model, name, queryId, params)
            .then(res => res)
            .catch(err => err)
    }

    const logIn = () => {

        entra
            .authenticate()
            .then(async (result) => {
				push('/')
            })
            .catch((err) => {
                console.log(err)
                showAlert(err.message, 1, 10000)
            })
    }


</script>

<SignIn
		{title}
		{site}
		{loginTitle}

		on:submit={logIn}
>

</SignIn>
