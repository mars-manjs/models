# Examples


## Basic Example
### Data
url : `api.example.com/data`
```json
{
    "foo" : "bar",
    "num" : 1234
}
```
### Model
```ts

// model instantiation

class ExampleDataModel extends Model{
    constructor(){
        super({
            repos: new APIRepo({path: "api.example.com/data"})
        })
    }
}

// usage

const model = new ExampleDataModel()
await model.load()
model.foo // "bar"
model.num // 1234
```


## Multiple Repos Example
### Data
url : `api.example.com/data`
```json
{
    "foo" : "bar",
    "num" : 1234
}
```
### Model
```ts

// model instantiation

class ExampleDataModel extends Model{
    constructor(){
        super({
            repos: {
                main: new APIRepo({path: "api.example.com/data"}),
                submit: new APIRepo({path: "api.example.com/data", method: "POST"}),
            }
        })
    }
}

// usage

const model = new ExampleDataModel()
await model.load()

model.repos.submit.call()

```



## Collections Example
### Data
```json
{
    "array" : [
        1,
        2,
        3
    ]
}
```
### Model
```ts
class ExampleDataModel extends CollectionModel{
    constructor(){
        super({
            repos: new APIRepo({path: "api.example.com/data"}),
            collections: { key: 'array', model: ExampleDataItemModel }
        })
    }
}

class ExampleDataItemModel extends Model{

}

const model = new ExampleDataModel()
await model.load()

model.collection 
/**
Collection([
    ExampleDataItemModel(1),
    ExampleDataItemModel(2),
    ExampleDataItemModel(3)
])
 **/
model.collections
/**
 Collections({
     main: Collection([
        ExampleDataItemModel(1),
        ExampleDataItemModel(2),
        ExampleDataItemModel(3)
     ])
 })
 **/
 
```

## Multiple Collections
### Data
```json
{
    "array" : [
        1,
        2,
        3
    ],
    "iterator": [
        {
            "foo": 123
        },
        {
            "bar" : 456
        }
    ]
}
```

```ts
class ExampleDataModel extends CollectionModel{
    constructor(){
        super({
            repos: {
                main: new APIRepo({path: "api.example.com/data"})
            }
            collections: {
                main: { key: 'array', model: ExampleDataItemModel },
                second: { key: 'iterator', model: ExampleDataItemModel },
            }
        })
    }
}

class ExampleDataItemModel extends Model{

}

const model = new ExampleDataModel()
await model.load()

model.collection 
/**
Collection([
    ExampleDataItemModel(1),
    ExampleDataItemModel(2),
    ExampleDataItemModel(3)
])
 **/
model.collections
/**
 Collections({
     main: Collection([
        ExampleDataItemModel(1),
        ExampleDataItemModel(2),
        ExampleDataItemModel(3)
     ])
     second: Collection([
        ExampleDataItemModel({foo: 123}),
        ExampleDataItemModel({bar: 123})
     ])
 })
 **/
 
```