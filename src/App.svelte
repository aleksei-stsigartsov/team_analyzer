<script>
    import Router from 'svelte-spa-router'
    import Sidebar from './components/views/general/sidebar.svelte'
    import Navbar from './components/views/general/header.svelte'
    import Alert from './components/widgets/alert.svelte'
    import { Breadcrumb, BreadcrumbItem } from 'flowbite-svelte'
    import { alert, isLogged, user, darkMode } from './storage/core_store'
    import { onMount } from 'svelte'
    import { routes } from './routes.js'
    import { location } from 'svelte-spa-router'

    onMount(()=>{
        if(!localStorage.getItem("color-theme")) {$darkMode = false; return}
        localStorage.getItem("color-theme") === 'light' ? $darkMode = false : $darkMode = true
    })

    const setLocation = (path, cond) => {
        let relocate
        if(cond === 'home'){
            if(path === 'file' || path === 'files') {
                relocate = `${window.location.origin}/#/files`
            }else if(path === 'admin'){
                relocate = `${window.location}`
            }
            else{
                relocate = `${window.location.origin}/#/${path}`
            }
        }
        window.location.href = relocate
    }
</script>

{#if $alert.msg}
    <Alert/>
{/if}

{#if $isLogged}
    <header class='sticky top-0 z-40 mx-auto w-full flex-none border-b border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800'>
        <Navbar/>
    </header>
{/if}
<div class='overflow-hidden lg:flex'>
    {#if $isLogged}
        <Sidebar/>
    {/if}
    <div class='relative h-full w-full overflow-y-auto  dark:bg-gray-800' class:ml-[50px]={$isLogged}>
        <main class='relative h-full w-full overflow-y-auto bg-gray-50 p-4 dark:bg-gray-900'>
            {#if $isLogged}
                <Breadcrumb class='mb-5'>
                    {#each $location.split('/') as path, index}
                        {#if path}
                            {#if index === 1}
                            <div class="flex items-center" on:click={()=>setLocation(path, 'home')}>
                                <BreadcrumbItem class='capitalize inline-flex items-center cursor-pointer' home>{path}</BreadcrumbItem>
                            </div>
                            {/if}
                            {#if index !== 1 && index !== $location.split('/').length - 1}
                                <BreadcrumbItem
                                        class='inline-flex items-center capitalize text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-white'>{path}</BreadcrumbItem>
                            {/if}
                            {#if index === $location.split('/').length - 1 && $location.split('/').length > 2 }
                                <BreadcrumbItem class='capitalize inline-flex items-center'>{path}</BreadcrumbItem>
                            {/if}
                        {/if}
                    {/each}
                </Breadcrumb>
            {/if}
            <Router {routes}/>
        </main>
    </div>
</div>
