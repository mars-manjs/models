# Repo


# Concepts
- **Main Repo:** if there is a repo named main, it is used for the model's functionality  

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

# APIRepo
## Config
| Name | Default | Description | 
| --- | --- | --- |
| path | '' | the URL path to be called by the API |
| method | 'GET' | the HTTP verb to be used with the call | 
| headers | {} | the headers for the HTTP request, can be either a function or an object | 
| body | undefined | the body for the HTTP request, can be either a function or an object |


# MockRepo



# Future Improvements
- add repos
    - GraphQL
    - Firestore
    - S3
