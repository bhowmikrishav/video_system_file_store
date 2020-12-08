const mongodb = require('mongodb')
const mongodb_config = require('../manifest/mongodb_config.json')
const os = require('os')

class DB{
    static async mongodb_video_system(){
        if(DB.mongodb_con) return DB.mongodb_con.db(mongodb_config.video_system.name)
        DB.mongodb_con = await DB.mongodb_client.connect()
        return DB.mongodb_con.db(mongodb_config.video_system.name)
    }
}
DB.mongodb_con = null
DB.mongodb_client = new mongodb.MongoClient(
    mongodb_config.video_system.uri,
    mongodb_config.video_system.config
);
DB.mongodb_client.connect()
.then(con => DB.mongodb_con = con)
.catch( err => console.log(err))

const cassandra = require('cassandra-driver');
 
const cassandra_client = new cassandra.Client({
    contactPoints:['127.0.0.1:9042'],
    localDataCenter:"datacenter1",
    credentials: { username: 'cassandra', password: 'cassandra' },
    keyspace: 'video_store'
  });
  
class Keyspace{
    static client(){return cassandra_client}
    static mk_unique_id(){
        return `${os.hostname()}|${os.uptime()}|${process.pid}|${mongodb.ObjectId().toString()}`
    }
}
Keyspace.COMMANDS = {};
Keyspace.COMMANDS['INSERT_PUBLIC_OBJECT'] = `
    INSERT INTO public_objects ( user_id, _id, data) VALUES ( ?, ?, ?)
`;


module.exports = {DB, Keyspace}