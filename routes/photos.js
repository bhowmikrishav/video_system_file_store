const jwt = require('jsonwebtoken')
const private_manifest = require('../manifest/private.json')
const {Photos} = require('../actions/photos')
const {User} = require('../actions/user')

module.exports = [
    {
        method: 'POST',
        url: '/set_file/profile_photo',
        handler: async (request, reply) => {
            try{
                const file = await request.file()
                const fields = file.fields
                const user = User.verify(file.fields.user_token)
                const file_buffer = await fields.file.toBuffer()
                const img100x100 = Photos.uploadphoto(user._id, file_buffer, 100, 100);
                const img250x250 = Photos.uploadphoto(user._id, file_buffer, 250, 250);
                const img500x500 = Photos.uploadphoto(user._id, file_buffer, 500, 500);
                console.log(
                    {img100x100, img250x250, img500x500}
                );
                return {img100x100, img250x250, img500x500}
            }catch(e){
                reply.code(504)
                console.log(e);
                return {error:e.message, result:null}
            }
        }
    }
]