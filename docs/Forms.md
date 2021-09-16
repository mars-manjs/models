# Form 
The goal of the form is 
- to use the same DTO object the server expects to validate the input
    - this requires formatting the data to/from frontend and backend data structure
- to abstract 


# Concepts
- **Backend Data Structure**: the data structure your backend expects
- **Form Data Structure**: the data structure your form / frontend expects. We differentiate because working with flat data is convenient, but your backend may expect nested data
- **Validator**: The form is designed to work with the same DTO object as your backend uses - written with 

# Config

| Name | Default | Description | 
| --- | --- | --- |
| validator | `undefined` | validator class built with [class-validator](https://npmkjs.com/class-validator) | 
| data | `{}` | initialize form with data | 
| keys | `[]` | mapping of form data structure to **backend data structure** |
| repo | `undefined` | repo to load the form data from |

## Config: data
data to initialize the form with, passed as the backend form structure


## Config: validator
The validator is built with `class-validator`. A key goal of `@Mars-man/models` is to be able to utilize the same validator on the frontend as you do on the backend. For this reason the config option **keys** is provided to enable a mapping between the server validator data structure and the form data structure.

## Config: keys
```ts
["cpuCount", {key: "resources.cpuCount", cast: Number}],
["name", "info.name"]
```

the `keys` attribute enables mapping between form data structure and **backend data structure**. This is important for when you want to have a different structure for the frontend than the backend accepts. It is used for mapping both the form data and the form validation data. 

Generally, it is best to keep forms as flat as possible to make referencing the form data easier and cleaner, however APIs and servers may want the data to be nested in a specific way. for this reason you can define the nested values as period delimited strings.
```ts
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


// you can add type casting
["cpuCount", {key: "resources.cpuCount", cast: Number}]

// you can create your own type casting function
function toLowerCase(value: string){
    return value.toLowerCase()
}
["name", {key: "info.name", cast: toLowerCase}],
```

## Config: repo
If the data for the form is loaded dynamically by the model you can define a `repo` to load the data from.

The form then subscribes to the `onLoad: PubSub` and sets the `data` once the repo has loaded 
```ts
// 
```


# Form Functions
## `onChange(key: string)` 
```
@param key: string - key of the form value

@desc returns a function which takes
    - Event: where value is e.target.value
    - any: string, number ...
```


## `convert(obj, map, castMap)`
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

## `validate`
- validates the data against the validator class
- converts the errors from the backend data structure -> form data structure


## `validateDebounce`
calls the validate function with a `200ms` debounce applied, this is called by the `onChange` function so as to show errors as the user is filling out the form 

# Form Getters
## `payload`
```
converts the form data structure to the paylod data strcutre 
```

## `outMap`
```
provides a mapping for form keys -> backend keys

returns this.keyMap
```

## `inMap`
```
provides a mapping for backend keys -> form keys

inverts keyMap
```

## `keyMap`
```
provides a mapping for form keys -> backend keys
```

## `inCast`
```
returns an object with the keys as the form keys, and the value as the cast function

this is for casting backend values -> form values
```

## `outCast`
```
returns an object with the keys as the backend keys, and the value as the cast function

this is for casting form values -> backend values 
```


## `data`
```
returns form data in the form data structure
```

## `payload`
```
returns form data in the backend data structure
```

## `isValid`
```
returns boolean - whether the form data is valid against the validator class provided
```



# Form Setters
## `data`
the data setter converts the data from backend data structure -> form data structure


# Form Examples
 


- Conversions
```ts
new FormModel({
    validator: CreateDeploymentDTO,
    keys: [
        ["cpuCount", {key: "resources.cpuCount", cast: Number}],
        ["name", "info.name"]
    ]
})
```




# Future Improvements
- config option: convert incoming data or not
    - currently converts backend data -> form data
- config option: convert data before validation
    - currently converts before
- config option: validate in onChange