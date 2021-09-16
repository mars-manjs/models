## Config
### Config: children
Format #1: Model
```
{
    children: Model
}

when the mainRepo returns an array
```
Format #2: {model: Model, name: string, key: string}
```
{
    children: {
        model: Model,
        name: 'collectionName',
        key: 'key.to.iterate'
    }
}

the mainRepo should return an object with an array at 'key.to.iterate'

access the collection with model.collectionName

```

Format #3 {model: Model, name: string, key: string}[]
```
    children: [
        {
            model: Model,
            name: 'collectionOne',
            key: 'iter.one',
        },
        {
            model: Model,
            name: 'collectionTwo',
            key: 'iter.two',
        }
    ]
```


### Config: repos
Format #1
```ts
{
    repos: BaseRepo
}

if only one repository is defined, that repository will be the main repository
```

Format #2
```ts
{
    repos: [
        {
            repo: new BaseRepo({path: '/abc'}),
            name: 'mainRepo'
        },
        {
            repo: new BaseRepo({path: '/xyz'}),
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
            form: new FormModel(),
            name: 'loginForm'
        }
    ]
}
```
