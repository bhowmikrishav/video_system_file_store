const {User} = require('../actions/user')
const {Keyspace} = require('../actions/connect_db')
const jwt = require('jsonwebtoken')
const private_manifest = require('../manifest/private.json')

module.exports = [
    {
        method: 'POST',
        url: '/get_object',
        schema:{
            body:{
                type: 'object',
                properties: {
                    user_token:   {type:'string', maxLength:1000, minLength:8, "pattern": "^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$"},
                    file_token:   {type:'string', maxLength:1000, minLength:8, "pattern": "^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$"},
                }
            }
        },
        handler: async (request, reply) => {
            const body = request.body
            try{
                const user = body.user_token?User.verify(body.user_token):null
                const file_token_data = jwt.verify(body.file_token, private_manifest.OBJECT_TOKEN_KEY)
                if(file_token_data.access === '*'){}
                else if((file_token_data.access === 'user') && user && (user.user_id === file_token_data.user_id)){}
                else{ throw Error("Permission denied")}
                const result = await Keyspace.client().execute(
                    Keyspace.COMMANDS.GET_PUBLIC_OBJECT,
                    [ file_token_data.object_id],
                    { prepare: true }
                )
                if(result.rows.length){
                    reply.code(200)
                    .header('Content-Type', file_token_data.mime_type)
                    .send(result.rows[0].data)
                }else{
                    throw Error("Object not found")
                }
                //return (result.rows.length)
                //return Object.assign(user, file_token_data, result);
            }catch(e){
                reply.code(301)
                return {error:e.message, result:null}
            }
        }
    },
    {
        method: 'GET',
        url: '/get_public_object',
        schema:{
            querystring : {
                file_token: {type:'string', maxLength:1000, minLength:8, "pattern": "^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$"}
            }
        },
        handler: async (request, reply) => {
            const body = request.query
            try{
                const file_token_data = jwt.verify(body.file_token, private_manifest.OBJECT_TOKEN_KEY)
                if(file_token_data.access !== '*') { throw Error("Permission denied")}
                const result = await Keyspace.client().execute(
                    Keyspace.COMMANDS.GET_PUBLIC_OBJECT,
                    [ file_token_data.object_id],
                    { prepare: true }
                )
                if(result.rows.length){
                    reply.code(200)
                    .header('Content-Type', file_token_data.mime_type)
                    .send(result.rows[0].data)
                }else{
                    throw Error("Object not found")
                }
                //return (result.rows.length)
                //return Object.assign(user, file_token_data, result);
            }catch(e){
                reply.code(301)
                return {error:e.message, result:null}
            }
        }
    }
]