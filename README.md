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