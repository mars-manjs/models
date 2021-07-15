# Data Model / Form / Repository Pattern

## tests
```
# run full test suite
`jest`

# run specific test suite
`jest forms.test.ts`

# run specific test 
`jest model.test.ts -t "async true"`
```

# Form 
The goal of the form is 
- to use the same DTO object the server expects to validate the input
    - this requires formatting the data to/from frontend and backend data structure
- to abstract 

## Config

| Name | Default | Description | 
| --- | --- | --- |
| validator | undefined | validator class built with [class-validator](https://npmkjs.com/class-validator) | 
| data | undefined | initialize form with data | 
| keys | undefined | mapping of form data structure to payload data structure |

### Config: data
data to initialize the form with, passed either in the backend data structure or the form data structure

### Config: validator
The validator is built with class-validator. A key goal of <PROJECT_NAME> is to be able to utilize the same validator on the frontend as you do on the backend. For this reason the config option **keys** is provided to enable a mapping between the server validator data structure and the form data structure.

### Config: keys
```
["cpuCount", {key: "resources.cpuCount", cast: Number}],
["name", "info.name"]
```

the keys attribute enables mapping between form data structure and payload data structure. This is important for when you want to have a different structure for the frontend than the backend accepts. It is used for mapping both the form data and the form validation data. 

Generally, it is best to keep forms as flat as possible to make referencing the form data easier and cleaner, however APIs and servers may want the data to be nested in a specific way. for this reason you can define the nested values as period delimited strings.
```
// a form data structure may be 
{
    name: "John Smith"
} 
// but the server may expect it to be 
{
    info: {
        name: "John Smith"
    }
}
// so you can define the keys as 
["name", "info.name"]
```

this also enables you to define type cast 

## Form Functions
### `onChange(key: string)` 
```
@param key: string - key to change value to

@desc returns a function to be called by the user interface to update the value associated with the key

```
### `convert(obj, map, castMap)`
```
@param **obj**: object to be converted
@param **map**: map keys of obj to desired data structure
@param **castMap**: type cast values of obj to desired data type, keys are the map

converts obj to desired structure depending on the map and castMap provided


@example
convert({name: "John Smith", num: "123"}, {"name" : "info.name"}, {num: Number, "info.name" : toLowerCase})
-> {
    info: {name: "john smith"}, // name is nested, and function toLowerCase has converted it for us
    num: 123                    // num has changed types
}
```

### `payload`
```
get function that converts the form data structure to the paylod datastrcutre 
```
## Form Examples
 


- Conversions
```ts
new BaseFormModel({
    validator: CreateDeploymentDTO,
    keys: [
        ["cpuCount", {key: "resources.cpuCount", cast: Number}],
        ["name", "info.name"]
    ]
})
```



# Repo
## Config

| Name | Default | Description | 
| --- | --- | --- |



## Repo Functions
### `preCall()`
```
sets the state of the repo to 'loading' or 'reloading'

@return undefined
```
### `fetch()`
```
calls the API and sets the response to "this.response" object

@return undefined
```
### `parse()`
```
parses the "this.response" object into the "this.data" object 

@return undefined
```

### `postCall()`
```
sets the "this.state" of the repo to 'loaded' or 'error' based off of the "this.data" or "this.response" object

@return undefined
```

### `call()`
```
makes a call to the repository, calls the following functions in this order
1. `preCall`  : set the repo state to loading
2. `fetch`    : calls the API
3. `parse`    : to parse the response
4. `postCall` : set the repo state to loaded or error 

@return undefined
```

# APIRepository
## Config
| Name | Default | Description | 
| --- | --- | --- |
| path | '' | the URL path to be called by the API |
| method | 'GET' | the HTTP verb to be used with the call | 
| headers | {} | the headers for the HTTP request, can be either a function or an object | 
| body | undefined | the body for the HTTP request, can be either a function or an object |



# Model
## Config
### Config: children
Format #1: BaseDataModel
```
{
    children: BaseDataModel
}

when the mainRepo returns an array
```
Format #2: {model: BaseDataModel, name: string, key: string}
```
{
    children: {
        model: BaseDataModel,
        name: 'collectionName',
        key: 'key.to.iterate'
    }
}

the mainRepo should return an object with an array at 'key.to.iterate'

access the collection with model.collectionName

```

Format #3 {model: BaseDataModel, name: string, key: string}[]
```
    children: [
        {
            model: BaseDataModel,
            name: 'collectionOne',
            key: 'iter.one',
        },
        {
            model: BaseDataModel,
            name: 'collectionTwo',
            key: 'iter.two',
        }
    ]
```


### Config: repos
Format #1
```ts
{
    repos: BaseRepository
}

if only one repository is defined, that repository will be the main repository
```

Format #2
```ts
{
    repos: [
        {
            repo: new BaseRepository({path: '/abc'}),
            name: 'mainRepo'
        },
        {
            repo: new BaseRepository({path: '/xyz'}),
            name: 'getXYZ'
        }
    ]
}
```


### Config: forms
```ts
{
    forms: [
        {
            form: new BaseFormModel(),
            name: 'loginForm'
        }
    ]
}
```


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

class ExampleDataModel extends BaseDataModel{
    constructor(){
        super({
            repos: new APIRepository({path: "api.example.com/data"})
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

class ExampleDataModel extends BaseDataModel{
    constructor(){
        super({
            repos: {
                main: new APIRepository({path: "api.example.com/data"}),
                submit: new APIRepository({path: "api.example.com/data", method: "POST"}),
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
class ExampleDataModel extends BaseDataCollection{
    constructor(){
        super({
            repos: new APIRepository({path: "api.example.com/data"}),
            collections: { key: 'array', model: ExampleDataItemModel }
        })
    }
}

class ExampleDataItemModel extends BaseDataModel{

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
class ExampleDataModel extends BaseDataCollection{
    constructor(){
        super({
            repos: {
                main:   new APIRepository({path: "api.example.com/data"})
            }
            collections: {
                main: { key: 'array', model: ExampleDataItemModel },
                second: { key: 'iterator', model: ExampleDataItemModel },
            }
        })
    }
}

class ExampleDataItemModel extends BaseDataModel{

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