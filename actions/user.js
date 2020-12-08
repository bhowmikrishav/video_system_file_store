//const mongodb = require('mongodb')
const {DB} = require('./connect_db')
const jwt = require('jsonwebtoken')
const private_manifest = require('../manifest/private.json')

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
}

module.exports = {User}