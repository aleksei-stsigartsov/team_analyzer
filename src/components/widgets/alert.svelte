<script>
    import { Alert, Button } from 'flowbite-svelte'
    import { InfoCircleSolid } from 'flowbite-svelte-icons'
    import { fly } from 'svelte/transition'
    import { alert } from '../../store.js'

    const closeAlert = () => {
        $alert.msg = ''
        $alert.code = ''
    }

</script>


<div class='fixed top-2  left-0 w-full flex justify-center items-center' style='z-index: 100'>
	{#if $alert.type === 1}
		<Alert color='red' class="dark:bg-gray-900" dismissable>
			<InfoCircleSolid slot='icon' class='w-4 h-4'/>
			{$alert.msg}
			<Button slot='close-button' size='xs' let:close on:click={closeAlert} class='ms-auto !bg-red-500'>X</Button>
		</Alert>
	{/if}
	{#if $alert.type === 0}
		<Alert color='green' class='dark:bg-gray-900' dismissable>
			<InfoCircleSolid slot='icon' class='w-4 h-4'/>
			{$alert.msg}
			<Button slot='close-button' size='xs' let:close on:click={closeAlert} class='ms-auto !bg-green-500'>X</Button>
		</Alert>
	{/if}
</div>
