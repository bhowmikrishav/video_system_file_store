const server_manifest = require('./manifest/server_manifest.json')
const fastify = require('fastify')(server_manifest.fastify_options)
fastify.register(require('fastify-formbody'))
fastify.register(require('fastify-multipart'))
fastify.addContentTypeParser('*', function (request, payload, done) {done()})
fastify.register(require('fastify-cors'))
const get_file_routes = require('./routes/')
get_file_routes.forEach((route)=>{fastify.route(route)})

fastify.register(require('fastify-websocket'))
fastify.get('/ws/video_file_upload', { websocket: true }, require('./routes/ws/video_file_upload'))

fastify.listen(( process.env.PORT || server_manifest.port), server_manifest.host)