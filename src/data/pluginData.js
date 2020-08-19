const fs = require('fs')
const path = require('path')

module.exports = function () {
    const data = fs.readFileSync(path.resolve(__dirname, 'pluginData.dat'))

    return JSON.parse(data);
}
