const uniqueValue = () => {
  return Math.random().toString(36).substr(2, 7)
}

module.exports = uniqueValue
