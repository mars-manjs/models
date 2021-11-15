# Documentation
- [ ]


# Testing
- [ ] test pubsub

## Models
- [ ] test pub sub on models
- [ ] test children


## Repo
APIRepo won't attempt to parse body if not status code 200
- error message may be on body though!


# Types
## CollectionModel
```ts
// should detect that the objects in the array should all be the same type
// currently the following doesn't throw a type error
const model = new CollectionModel({ collections: Model, data: [{ abc: 123 }, { abc: 123 }, { xyz: 123 }] })
```


# Mars Man Components
