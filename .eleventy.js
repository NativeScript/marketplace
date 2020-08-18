const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight')
const striptags = require('striptags')

module.exports = function(eleventyConfig) {
    eleventyConfig.addPlugin(syntaxHighlight)
    eleventyConfig.addNunjucksFilter('json', function(value) {
        return JSON.stringify(value, null, 2)
    })
    eleventyConfig.addNunjucksFilter('markdown', function(value) {
        try {
            let markdown = require('markdown-it')();
            return markdown.render(value);
        } catch (e) {
            return ''
        }
    })
    eleventyConfig.addNunjucksFilter('strip', function(value) {
        try {
            return striptags(value, []);
        } catch (e) {
            return ''
        }
    })


    return {
        dir: {
            input: 'pages',
            output: 'dist',
            // This value is relative to the input directory.
            includes: '../src',
            data: '../src/data',
        }
    }
}
