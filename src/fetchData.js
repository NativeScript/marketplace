const npmSearch = require('libnpmsearch')
const fs = require('fs')
const path = require('path')

async function fetchAllNativeScriptPlugins() {
    const limit = 100
    let offset = 0
    const results = []

    while (true) {
        console.log(`fetching results [${offset}-${offset + limit}]`)
        const res = await npmSearch('nativescript', {
            limit: 100,
            from: offset
        })
        results.push(...res)
        offset += res.length + 1
        if (res.length < limit) {
            break;
        }
    }

    // results.map(plugin => {
    //     if (!plugin.author) {
    //         plugin.author = {
    //             name: plugin.publisher.username,
    //             email: plugin.publisher.email
    //         }
    //     } else {
    //         plugin.author.publisher = plugin.publisher.username
    //     }
    // })

    return results
}

async function run() {
    const authors = {}
    let plugins = await fetchAllNativeScriptPlugins()
    console.log(plugins)
    plugins.forEach(plugin => {
        if(!plugin.author) {
            return
        }

        if (!authors[plugin.author.name]) {
            authors[plugin.author.name] = {
                name: plugin.author.name,
                email: plugin.author.email,
                plugins: []
            }
        }
        authors[plugin.author.name].plugins.push(plugin)
    })

    // remove duplicates if npm api returned something multiple times
    plugins = plugins.filter((plugin, index) => {
        return plugins.indexOf(plugin) === index
    })

    await fs.promises.writeFile(path.resolve(__dirname, 'data', 'plugins.json'), JSON.stringify(plugins, null, 2))
    await fs.promises.writeFile(path.resolve(__dirname, 'data', 'authors.json'), JSON.stringify(Object.values(authors), null, 2))
}

run().catch(err => {
    console.log('Something went wrong...', err)
    process.exit(1)
})
