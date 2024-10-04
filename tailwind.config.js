module.exports = {
    content: [
        "./src/**/*.{html,js,svelte,ts,md}",
        "./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}",

    ],
    //media: false,
    plugins: [
        require('flowbite/plugin')
    ],
    darkMode: 'class',
    corePlugins: {
        preflight: false,
    }
}
