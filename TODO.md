# Documentation
- [ ]


# Testing
- [ ] test pubsub

## Models
- [ ] test pub sub on models
- [ ] test children



# Types
## CollectionModel
```ts
// should detect that the objects in the array should all be the same type
// currently the following doesn't throw a type error
const model = new CollectionModel({ collections: Model, data: [{ abc: 123 }, { abc: 123 }, { xyz: 123 }] })
```


# Mars Man Components