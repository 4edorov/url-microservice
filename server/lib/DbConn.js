const MongoClient = require('mongodb').MongoClient
const debug = require('debug-levels')('DbConn')


const env = process.env.NODE_ENV
const dbName = 'development'
const collName = 'urling'

const getMongoUri = () => {
  let mongoUri
  if (env === 'production') {
    mongoUri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ds245218.mlab.com:45218/development`
  }
  if (env === 'development') {
    mongoUri = 'mongodb://localhost:27017'
  }

  debug.debug('mongoUri', mongoUri)
  return mongoUri
}

const DbConn = {
  conn: null,
  mongoUri: getMongoUri(),
  init: async function() {
    if (DbConn.conn) {
      return DbConn.conn
    }
    const dataBase = await MongoClient.connect(DbConn.mongoUri)
    DbConn.conn = dataBase.db(dbName)
    
    return DbConn.conn
  },
  getColl: () => {
    return DbConn.conn.collection(collName)
  }

}

module.exports = DbConn
