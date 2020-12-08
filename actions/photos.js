const jimp = require('jimp')
const {Keyspace} = require('./connect_db')

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
        return result
    }
}