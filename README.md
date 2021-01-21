# video_system_file_store

## DB setup
```cql
CREATE KEYSPACE video_system 
WITH replication = {'class':'SimpleStrategy', 'replication_factor' : 1};

USE video_system;

CREATE TABLE public_objects (
    id text PRIMARY KEY,
    user_id text,
    data blob
);
```

## Manifest

- cassandra_config.json

```js
{
    "contactPoints":[string],  //cluster path | example 123.123.123.123:9042
    "localDataCenter":"datacenter1",
    "credentials": { "username": string, "password": string },
    "keyspace": "video_system" // can be changed else too, if required
}
```

- mongodb_config.json

```js
{
    "video_system" : {
        "name" : "video_system",        //database name
        "uri" : "mongodb+srv://<username>:<password>@<host>/video_system?retryWrites=true&w=majority", //mongodb URI
        "config" : { "useNewUrlParser": true, "useUnifiedTopology": true }
    }
}
```

- private.json

```js
// JWT token keys
{
    "USER_TOKEN_KEY" : string,
    "OBJECT_TOKEN_KEY" : string
}
```

- server_manifest.json

```js
//fastify server manifest
{
    "port":1755,                //default port of env.PORT is not defined
    "host":"0.0.0.0",           //go global
    "fastify_options":{
        "logger": true,         //when vebros
        "file": "./server/logs"
    }
}
```