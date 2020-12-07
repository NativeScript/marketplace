module.exports = function () {
  const data = Array.from(require('./plugins.json'));

  data.sort((a,b) => {
    return b.downloadStats.lastMonth - a.downloadStats.lastMonth;
  })

  return data;
}
