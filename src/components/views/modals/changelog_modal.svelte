<script>
    import { ExpandableTile } from "carbon-components-svelte"
    import Close from "carbon-icons-svelte/lib/Close.svelte"
    import changelog from '../../changelog.json'
    export let isOpencl = false

    let logs = []
    logs = changelog
</script>

{#if isOpencl}
    <!-- Large Modal -->
    <div id="large-modal" tabindex="-1"
         class=" overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-auto h-modal md:h-full modalBackground"
         aria-hidden="true">
        <div class="relative p-4 w-full mt-[100px] border-2 max-w-4xl h-full md:h-auto ml-auto mr-auto">
            <!-- Modal content -->
            <div class="relative bg-white rounded-lg  shadow dark:bg-gray-700">
                <!-- Modal header -->
                <div class="flex justify-between items-center p-5 rounded-t border-b dark:border-gray-600">
                    <h3 class="text-xl font-medium text-gray-900 dark:text-white">
                        Changelog
                    </h3>
                    <button on:click={() => isOpencl = false} type="button"
                            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                            data-modal-toggle="large-modal">
                        <Close size={32}/>
                    </button>
                </div>
                <!-- Modal body -->
                <div class="p-6 space-y-6 overflow-y-scroll" style="height: 45rem;">
                    <div class="mb-4 border-b border-gray-200 dark:border-gray-700">
                        {#each logs as log}
                            <ExpandableTile>
                                <div slot="above">{log.version} ({log.date})</div>
                                <div slot="below">{log.message}</div>
                            </ExpandableTile>
                        {/each}
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    .modalBackground {
        background: rgba(117, 141, 233, 0.1);
        border-radius: 16px;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(2.1px);
        -webkit-backdrop-filter: blur(2.1px);
        border: 1px solid rgba(117, 141, 233, 0.3);
    }
</style>
