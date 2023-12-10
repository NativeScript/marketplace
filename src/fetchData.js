const path = require('path')
const fs = require('fs')
const npmSearch = require('libnpmsearch')
const axios = require('axios')
const Fuse = require('fuse.js')
const PQueue = require('p-queue').default
const Gauge = require('gauge')

const Prism = require("prismjs");
const markdownPrismJs = require('@11ty/eleventy-plugin-syntaxhighlight/src/markdownSyntaxHighlightOptions')
const md = require('markdown-it')({
    html: true
});
const highlightFunction =  markdownPrismJs()
md.set({
    highlight: (code, language) => {
        if(!Prism.languages[language]) {
            language = 'bash'
        }
        return highlightFunction(code, language)
    }
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
        // let name = plugin.maintainers[0].username
        // if (plugin.author && plugin.author.name) {
        //     name = plugin.author.name
        // }
        plugin.author = {
            name: plugin.maintainers[0].username,//: plugin.maintainers[0].username,
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

    // replace invalid characters: '
    plugin.author.username = plugin.author.username.replace('\'', '')

    // in case we already have this username - we want to use the same data
    if (authorsMap[plugin.author.username]) {
        plugin.author = {
            name: authorsMap[plugin.author.username].name,
            username: authorsMap[plugin.author.username].username,
        }
    }
}

function keywords(plugin) {
    let name = plugin.name
    // remove scope from name
    if(plugin.scope !== 'unscoped') {
        name = plugin.name.substr(plugin.scope.length + 2)
    }
    const keywords = name.split('-')
    plugin.keywords = (plugin.keywords || []).concat(keywords)
}

async function fetchAllNativeScriptPlugins() {
    const limit = 100
    let offset = 0
    const results = []
    const gauge = new Gauge()
    gauge.show('fetching results', 0)
    while (true) {
        gauge.pulse(`[${offset}-${offset + limit}]`)
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
    gauge.hide()
    return results
}

async function getPackageDownloads(packageName, period) {
    try {
        const res = await axios.get(`https://api.npmjs.org/downloads/point/${period}/${packageName}`)
        return res.data.downloads
    } catch (e) {
        return 0
    }
}

async function getPackageDownloadStats(packageName) {
    return {
        lastDay: await getPackageDownloads(packageName, 'last-day'),
        lastWeek: await getPackageDownloads(packageName, 'last-week'),
        lastMonth: await getPackageDownloads(packageName, 'last-month'),
    }
}

async function getPackageData(packageName) {
    // todo: only re-fetch if updated
    const res = await axios.get(`https://registry.npmjs.org/${packageName}`)
    const downloadStats = await getPackageDownloadStats(packageName)
    const latest = res.data.versions[res.data['dist-tags']['latest']]

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
        readme: md.render(readme),
        downloadStats
    }
}

function buildIndex(plugins) {
    return Fuse.createIndex([
        {
            name: 'name',
            weight: 10
        },
        {
            name: 'keywords',
            weight: 5
        },
        {
            name: 'description',
            weight: 1
        }
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

        // ignore-list
        if ([
            'localized-strings',
            'nativescript-xmpp-client',
        ].includes(plugin.name)) {
            return false
        }

        return true
    })

    const promises = []
    for (const plugin of plugins) {
        // optimize keywords
        keywords(plugin)

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
            // console.log(`processing plugin ${plugins.indexOf(plugin) + 1} out of ${plugins.length}`)
            const data = await getPackageData(plugin.name).catch(err => {
                console.log('FAILED.', err)
                return {
                    name: plugin.name,
                    version: plugin.version,
                    license: '',
                    readme: '',
                    downloadStats: {
                        lastDay: 0,
                        lastWeek: 0,
                        lastMonth: 0
                    }
                }
            })
            pluginData[plugin.name] = data;
            plugin.downloadStats = data.downloadStats
        })
    }
    const queue = new PQueue({concurrency: 20});
    const gauge = new Gauge()
    gauge.show('fetching data')
    const total = promises.length
    queue.on('next', () => {
        gauge.pulse()
        gauge.show(`${total - queue.size} / ${total}`, 1 - (queue.size / total))
    });
    await queue.addAll(promises)
    await queue.onIdle();
    gauge.hide()

    // remove duplicates if npm api returned something multiple times
    plugins = plugins.filter((plugin, index) => {
        return plugins.findIndex(p => p.name === plugin.name) === index
    })

    // sort plugins by name
    plugins.sort((a, b) => {
        return a.name.localeCompare(b.name)
    })
    // pluginData.sort((a, b) => {
    //   return a.name.localeCompare(b.name)
    // })

    const authors = Object.values(authorsMap)

    // sort authors by username
    authors.sort((a, b) => {
      return a.username.localeCompare(b.username)
    })


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
