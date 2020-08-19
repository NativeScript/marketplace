const path = require('path')
const fs = require('fs')
const npmSearch = require('libnpmsearch')
const axios = require('axios')
const Fuse = require('fuse.js')
const PQueue = require('p-queue').default

// syntax highlighting for READMEs
const Prism = require("prismjs");
const langs = Prism.languages
Prism.languages = new Proxy(langs, {
    get(target, key) {
        if (target[key]) {
            return target[key]
        } else if (target[key.toLowerCase()]) {
            return target[key.toLowerCase()]
        }
        return target['bash']
    }
})
const markdownPrismJs = require('@11ty/eleventy-plugin-syntaxhighlight/src/markdownSyntaxHighlightOptions')
const md = require('markdown-it')({
    html: true
});
md.set({
    highlight: markdownPrismJs()
})

function author(plugin, authorsMap) {
    if (plugin.maintainers && plugin.maintainers.find(user => user.username === 'nativescript-bot') || plugin.scope === 'nativescript') {
        plugin.author = {
            name: 'NativeScript Team',
            username: 'nativescript'
        }
    } else if (plugin.scope === 'nstudio') {
        plugin.author = {
            name: 'nStudio',
            username: 'nstudio'
        }
    } else if (plugin.scope === 'nativescript-community') {
        plugin.author = {
            name: 'NativeScript Community',
            username: 'nativescript-community'
        }
    } else if (plugin.scope !== 'unscoped') {
        plugin.author = {
            name: plugin.scope,
            username: plugin.scope
        }
        // if (plugin.author && plugin.author.username && plugin.author.name) {
        //     plugin.author = {
        //         name: plugin.author.name,
        //         username: plugin.author.username
        //     }
        // } else {
        //     // scoped packages that don't have author data
        //     plugin.author = {
        //         name: plugin.scope,
        //         username: plugin.scope
        //     }
        // }
    } else if (plugin.author && plugin.author.username && plugin.author.name) {
        plugin.author = {
            name: plugin.author.name,
            username: plugin.author.username
        }
    } else if (plugin.maintainers && plugin.maintainers.length === 1) {
        let name = plugin.maintainers[0].username
        if (plugin.author && plugin.author.name) {
            name = plugin.author.name
        }
        plugin.author = {
            name,//: plugin.maintainers[0].username,
            username: plugin.maintainers[0].username
        }
    } else if (plugin.publisher) {
        plugin.author = {
            name: plugin.publisher.username,
            username: plugin.publisher.username,
        }
    } else {
        plugin.author = {
            name: 'Missing Author',
            username: 'missing'
        }
    }

    // in case we already have this username - we want to use the same data
    if (authorsMap[plugin.author.username]) {
        plugin.author = {
            name: authorsMap[plugin.author.username].name,
            username: authorsMap[plugin.author.username].username,
        }
    }
}

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
        //break;
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

async function getPackageData(packageName) {
    const res = await axios.get(`https://registry.npmjs.org/${packageName}`)

    const versions = Object.keys(res.data.versions)
    const latest = res.data.versions[versions[versions.length - 1]]

    let readme = 'No README found.'
    if (latest.readme) {
        readme = latest.readme
    } else if (res.data.readme) {
        readme = res.data.readme
    }

    return {
        name: packageName,
        version: latest.version,
        license: latest.license,
        readme: md.render(readme)
    }
}

function buildIndex(plugins) {
    return Fuse.createIndex([
        'name',
        'keywords',
        'description',
        'author.name',
        'author.username',
    ], plugins)
}

async function run() {
    const authorsMap = {}
    const pluginData = {}
    let plugins = await fetchAllNativeScriptPlugins()
    // console.log(plugins)

    plugins = plugins.filter(plugin => {
        // filter out packages that re-publish nativescript-vue (or similar)
        if (plugin.author && plugin.author.name === 'Igor Randjelovic') {
            return plugin.maintainers && plugin.maintainers.some(m => m.username === 'rigor789')
        }

        if (plugin.author && plugin.author.name === 'NativeScript Team') {
            return plugin.maintainers && plugin.maintainers.some(m => m.username === 'nativescript-bot')
        }

        return true
    })

    const promises = []
    for (const plugin of plugins) {
        // console.log(`processing plugin ${plugins.indexOf(plugin)} out of ${plugins.length}`)
        author(plugin, authorsMap)

        if (!authorsMap[plugin.author.username]) {
            authorsMap[plugin.author.username] = {
                ...plugin.author,
                plugins: []
            }
        }
        authorsMap[plugin.author.username].plugins.push(plugin)

        promises.push(async () => {
            console.log(`processing plugin ${plugins.indexOf(plugin) + 1} out of ${plugins.length}`)
            pluginData[plugin.name] = await getPackageData(plugin.name).catch(err => {
                console.log('FAILED.', err)
                plugin.data = {}
            })
        })
    }
    const queue = new PQueue({concurrency: 10});
    queue.on('next', () => {
        console.log(`${queue.size}\t${queue.pending}`)
        // console.log(`Task is completed.  Size: ${queue.size}  Pending: ${queue.pending}`);
    });
    await queue.addAll(promises)
    await queue.onIdle();
    console.log('done.')

    // remove duplicates if npm api returned something multiple times
    plugins = plugins.filter((plugin, index) => {
        return plugins.findIndex(p => p.name === plugin.name) === index
    })

    const authors = Object.values(authorsMap)

    await fs.promises.writeFile(path.resolve(__dirname, 'data', 'plugins.json'), JSON.stringify(plugins, null, 2))
    await fs.promises.writeFile(path.resolve(__dirname, 'data', 'pluginData.dat'), JSON.stringify(pluginData))
    await fs.promises.writeFile(path.resolve(__dirname, 'data', 'authors.json'), JSON.stringify(authors, null, 2))

    // build Fuse index
    const fuseIndex = buildIndex(plugins).toJSON()
    await fs.promises.writeFile(path.resolve(__dirname, 'data', 'fuseIndex.json'), JSON.stringify(fuseIndex, null, 2))
}

run().catch(err => {
    console.log('Something went wrong...', err)
    process.exit(1)
})
