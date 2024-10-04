<script>
    import { onMount } from 'svelte'
    import Router from 'svelte-spa-router'
    import routes from './router'
    import { query } from './service'
    import { setValue } from './storage/back_store'

    onMount(_ => {
    })
</script>

<main style="height: 100vh">
    <Router { routes } />
</main>

<style global>

    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    .bx--date-picker.bx--date-picker--single .bx--date-picker__input {
        width: 13rem!important;
        border: solid #d0d4da 1px!important;
        border-radius: 5px!important;
        background: #f7f8f9;
    }
    .border {
        border: solid #cbc7c7;
    }

    select {
        background-image: none!important;
    }
    .modalBackground {
        background: rgba(117, 141, 233, 0.1);
        border-radius: 16px;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(2.1px);
        -webkit-backdrop-filter: blur(2.1px);
        border: 1px solid rgba(117, 141, 233, 0.3);
    }

    table :global(td) {
        position: relative;


    }


    table :global(td) {
        position: relative;
    }

    table :global(tbody) {
        display: block;
        max-height: 75vh;
        min-height: 75vh;
        overflow-y: auto;
        transition: 0.5s;
    }
    @media screen and (max-height: 1060px) {

        table :global(tbody) {
            display: block;
            max-height: 75vh;
            min-height: 75vh;
            overflow-y: auto;
            transition: 0.5s;
        }

    }

    @media screen and (max-height: 900px) {

        table :global(tbody) {
            display: block;
            max-height: 75vh;
            min-height: 75vh;
            overflow-y: auto;
            transition: 0.5s;
        }

    }
    @media screen and (max-height: 600px) {

        table :global(tbody) {
            display: block;
            max-height: 75vh;
            min-height: 75vh;
            overflow-y: auto;
            transition: 0.5s;
        }

    }

    table :global(thead) {
        display:table;
        width:100%;
        transition: 0.3s;
        table-layout:fixed;
    }

    table :global(tr) {
        display:table;
        width:100%;
        transition: 0.3s;
        table-layout:fixed;
    }
    table :global(td) {

    }

    @media screen and (max-width: 1200px) {



        table.bx--data-table :global(thead) {
            border: none;
            clip: rect(0 0 0 0);
            height: 1px;
            margin: -1px;
            overflow: hidden;
            padding: 0;
            position: absolute;
            width: 1px;
        }

        table.bx--data-table :global(tr) {
            display: block;
            padding-bottom: 0.3em;
            margin-bottom: 0.3em;
            height: fit-content;
        }

        table.bx--data-table :global(td) {
            display: block;
            font-size: 0.8em;
            text-align: right;
        }

        table.bx--data-table :global(td::before) {
            content: attr(data-label);
            float: left;
            font-weight: bold;
        }

    }
    .bx--data-table tbody {
        background-color: #ffffff!important;
    }

    tr.bx--parent-row:not(.bx--expandable-row) td, tr.bx--parent-row.bx--expandable-row td, tr.bx--parent-row.bx--expandable-row {
        border-bottom: none!important;
    }
    .bx--data-table tbody tr  {
        border-bottom: solid darkgray 1px!important;
    }
    .bx--expandable-row td{
        border-bottom: solid darkgrey 2px!important;
    }

    *::-webkit-scrollbar {
        width: 8px;
        height: 4px;
    }

    *::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0);
    }

    *::-webkit-scrollbar-thumb {
        background-color: rgba(20, 31, 45, 0.52);
        outline: 0px solid #292c39;
        border-radius: 100px;
    }


</style>
