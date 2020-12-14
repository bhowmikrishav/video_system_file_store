//const mongodb = require('mongodb')
const {DB} = require('./connect_db')
const jwt = require('jsonwebtoken')
const private_manifest = require('../manifest/private.json')
const mongodb = require('mongodb')

class User extends DB{
    /*
    static create_user_tupple(username, password, name){
        return {
            username, password, name
        }
    }
    static async signup(username, password, name){
        const user_tupple = User.create_user_tupple(username, password, name)
        const user_collection = (await User.mongodb_video_system()).collection('users')
        const result = await user_collection.insertOne(user_tupple)
        return result.ops.length ? result.ops[0] : null
    }
    static async login(username, password){
        const user_collection = (await User.mongodb_video_system()).collection('users')
        const result = await user_collection.findOne({
            username
        })
        if (!result) throw Object.assign(Error("Username not found"), {code : 202})
        if (result.password != password) throw Object.assign(Error("Incorrect Password"), {code : 202})
        
        const user_token = jwt.sign( {username:result.username}, private_manifest.USER_TOKEN_KEY, {expiresIn:'1d'} )
        
        return {user_token}
    }
    */
    static verify(user_token){
        return jwt.verify(user_token, private_manifest.USER_TOKEN_KEY)
    }
    static async update_user_set(user_token, _set){
        const user = User.verify(user_token)
        const update_set = {
            "meta.profile_pic":_set.profile_pic,
        }
        console.log({_id : user.user_id});
        const user_collection = (await User.mongodb_video_system()).collection('users')
        var result = await user_collection.findOneAndUpdate(
            {_id : mongodb.ObjectId(user.user_id)},
            {$set:update_set},
            { returnOriginal: false }
        )
            
        return result
    }
}

module.exports = {User}