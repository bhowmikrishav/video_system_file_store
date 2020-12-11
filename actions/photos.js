const jimp = require('jimp')
const {Keyspace} = require('./connect_db')
const jwt = require('jsonwebtoken')
const private_manifest = require('../manifest/private.json')

class Photos extends Keyspace{
    static async uploadphoto( user_id, photo_buffer, height, width){
        const image = await (
                await jimp.read(Buffer.from(photo_buffer))
            ).quality(80).contain(width, height).getBufferAsync(jimp.MIME_JPEG)
            
        const unqiue_id = Photos.mk_unique_id()
        const result = await Photos.client().execute(
                Photos.COMMANDS.INSERT_PUBLIC_OBJECT,
                [ user_id, unqiue_id, image],
                { prepare: true }
            )
        const public_token_data = {
            access:'*',
            object_id:`${unqiue_id}`
        }
        const public_token = jwt.sign(public_token_data, private_manifest.OBJECT_TOKEN_KEY)
        const private_token_data = {
            access:'user',
            user_id:`${user_id}`,
            object_id:`${unqiue_id}`
        }
        const private_token = jwt.sign(private_token_data, private_manifest.OBJECT_TOKEN_KEY)
        return {public_token_data, private_token_data, public_token, private_token}
    }
}

module.exports = {Photos}