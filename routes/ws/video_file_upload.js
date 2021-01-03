const BSON = require('bson')
const {User} = require('../../actions/user')
const {DB, Keyspace} = require('../../actions/connect_db')
const mongodb = require('mongodb')

module.exports = (connection, req) => {
    var shut_down_function = async ()=>{try{connection.socket.close()}catch{}}
    var file_manifest, video_manifest;
    connection.socket.on('message', async message => {
        try{
            const data = BSON.deserialize(message)
            if(data.type === 'init'){
                const user = User.verify(data.data.user_token)
                video_manifest = {
                    title: data.data.title?data.data.title:data.data.name,
                    upload_time: Date.now(),
                    upload_id: null,
                    stream_manifest: {
                        "144": null,
                        "360": null,
                        "720": null
                    }
                }
                file_manifest = {
                    user_id: user.user_id,
                    name: data.data.name,
                    size: data.data.size,
                    mime_type: data.data.mime_type,
                    upload_size: 0,
                    upload_end: false,
                }
                const db = await DB.mongodb_video_system()
                const result = await db.collection('video_uploads').insertOne(
                    Object.assign(
                        {},
                        file_manifest,
                        {
                            size : file_manifest.size,
                            upload_size : file_manifest.upload_size,
                            chunks : []
                        }
                    )
                )
                file_manifest._id = result.insertedId.toString()
                video_manifest.upload_id = result.insertedId
                shut_down_function = async ()=>{
                    try{
                        connection.socket.close()
                    }catch{}
                    try{
                        const upload_tupple = await db.collection('video_uploads').findOne(
                            { _id : result.insertedId }
                        )
                        if(upload_tupple){
                            await Keyspace.client().execute(
                                Keyspace.COMMANDS.DELETE_PUBLIC_OBJECT(
                                    upload_tupple.chunks.map((chunk)=>{
                                        return chunk.object_id
                                    })
                                )
                            )
                            await db.collection('video_uploads').findOneAndDelete(
                                { _id : result.insertedId }
                            )
                        }
                    }catch{}
                }
                connection.socket.send(new Uint8Array(BSON.serialize({type:'update_manifest', data:{file_manifest}})))
            }else if(data.type === 'chunk'){
                //console.log(Object.keys(data), data.meta_data, data.data.buffer.length);
                if(     
                    (data.data.buffer.length > 102400)
                    ||  (     (data.data.buffer.length < 102400)
                        &&    ((file_manifest.size - file_manifest.upload_size) !== data.data.buffer.length)
                    )
                ){
                    //shut_down upload
                    await shut_down_function()
                }else if(data.meta_data.slice_start != file_manifest.upload_size){
                    //skip upload
                    connection.socket.send(new Uint8Array(BSON.serialize({type:'update_manifest', data:{file_manifest}})))
                }else{
                    try{
                        //store chunk
                        const object_id = Keyspace.mk_unique_id()
                        const chunk = await Keyspace.client().execute(
                            Keyspace.COMMANDS.INSERT_PUBLIC_OBJECT,
                            [ file_manifest.user_id, object_id, data.data.buffer],
                            { prepare: true }
                        )
                        const db = await DB.mongodb_video_system()
                        const update = await db.collection('video_uploads').updateOne(
                            {_id : mongodb.ObjectId(file_manifest._id)},
                            {   
                                $inc: {upload_size:data.data.buffer.length},
                                $push:  { 
                                    chunks: {object_id, slice_start: file_manifest.upload_size, size: data.data.buffer.length}
                                }
                            }
                        )
                        //console.log(update.result);
                        if(update.result.n) file_manifest.upload_size += Number(data.data.buffer.length)
                        if(file_manifest.upload_size >= file_manifest.size) {
                            //add video to video collections
                            db.collection('videos').insertOne(video_manifest)
                            file_manifest.upload_end = true
                        }
                    }catch(e){
                        console.log(e);
                    }
                    //update_manifest
                    //console.log(file_manifest);
                    connection.socket.send(new Uint8Array(BSON.serialize({type:'update_manifest', data:{file_manifest}})))
                }
            }
        }catch(e){
           await shut_down_function()
        }
        //console.log(data);
        //console.log(data.data.buffer.toString());
        // message === 'hi from client'
        // connection.socket.send('hi from server')
    })

    connection.socket.on('close', async ()=>{
        console.log("end");
    })

}