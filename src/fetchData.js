const path = require('path')
const fs = require('fs')
const npmSearch = require('libnpmsearch')
const axios = require('axios')

async function fetchAllNativeScriptPlugins() {
    const limit = 100
    let offset = 0
    const results = []

    while (true) {
        console.log(`fetching results [${offset}-${offset + limit}]`)
        const res = await npmSearch('nativescript', {
            limit,
            from: offset
        })
        results.push(...res)
        offset += res.length + 1
        // break;
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

function getAuthorsFromPlugin(plugin) {
    // todo: get the authors
    // problems:
    //  - re-published packages may still have the original "author" field
    //  - author field may not have username set
    //  - publisher may not be the author, but a maintainer
    // get all maintainers and add them as authors
    // get author.name
    // fall back to publisher.username
    // return plugin.maintainers
    console.log(plugin)
}

async function getPackageData(packageName) {
    return {
        name: packageName,
        version: 'latest',
        license: 'MIT',
        readme: 'README'
    }

    const res = await axios.get(`https://registry.npmjs.org/${packageName}`)

    const versions = Object.keys(res.data.versions)
    const latest = res.data.versions[versions[versions.length - 1]]

    return {
        name: packageName,
        version: latest.version,
        license: latest.license,
        readme: latest.readme || res.data.readme
    }
}

async function run() {
    const authors = []
    let plugins = await fetchAllNativeScriptPlugins()
    // console.log(plugins)

    // primary author from `plugin.author` field
    // if it's not set, we fall back to the publisher
    //

    for (const plugin of plugins) {
        getAuthorsFromPlugin(plugin)
        plugin.data = await getPackageData(plugin.name)
    }

    // remove duplicates if npm api returned something multiple times
    plugins = plugins.filter((plugin, index) => {
        return plugins.findIndex(p => p.name === plugin.name) === index
    })

    await fs.promises.writeFile(path.resolve(__dirname, 'data', 'plugins.json'), JSON.stringify(plugins, null, 2))
    await fs.promises.writeFile(path.resolve(__dirname, 'data', 'authors.json'), JSON.stringify(authors, null, 2))
}

run().catch(err => {
    console.log('Something went wrong...', err)
    process.exit(1)
})
