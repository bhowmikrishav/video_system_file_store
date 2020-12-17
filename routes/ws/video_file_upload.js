const BSON = require('bson')
const {User} = require('../../actions/user')
const {DB, Keyspace} = require('../../actions/connect_db')
const mongodb = require('mongodb')

module.exports = (connection, req) => {
    
    connection.socket.on('message', async message => {
        try{
            const data = BSON.deserialize(message)
            console.log(data.type, data.type === 'init', data.type == 'init');
            if(data.type === 'init'){
                const user = User.verify(data.data.user_token)
                console.log(data.data);
                file_manifest = {
                        user_id : user.user_id,
                        name : data.data.name,
                        size : data.data.size,
                        mime_type : data.data.mime_type,
                        upload_size : 0,
                        chunks : []
                    }
                const db = await DB.mongodb_video_system()
                const result = await db.collection('video_uploads').insertOne(
                    Object.assign(
                        file_manifest,
                        {
                            size : mongodb.Long(file_manifest.size),
                            upload_size : mongodb.Long(file_manifest.upload_size)
                        }
                    )
                )
                file_manifest._id = result.insertedId
                console.log(file_manifest);

                connection.socket.send(BSON.serialize({type:'oninit', data:{file_manifest}}))
                //oninit event
            
            }else if(data.type === 'chunk'){

            }
        }catch(e){
            connection.socket.close()
        }
        //console.log(data);
        //console.log(data.data.buffer.toString());
        // message === 'hi from client'
        // connection.socket.send('hi from server')
    })

}