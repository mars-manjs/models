![Mars Man Models Logo](./imgs/logo.png)

# Description
Data Model / Form / Repository Pattern

# Table of Contents
1. [Design Overview](#design-overview)
2. [Installation](#installation)
3. [API Documentation](<#API Documentation>)
3. [Examples](<#Examples>)

# Development
## System Requirements
- Dependencies: 
    - node: >14.15
    - npm:  >6.14
## Commands
```bash
# installation
npm i 

# tests
# run full test suite
`jest`

# run specific test suite
`jest forms.test.ts`

# run specific test 
`jest model.test.ts -t "async true"`

# build
npm run build

# publish
npm publish
```


# [Form](<./docs/Forms.md>) 
The goal of the form is 
- to use the same DTO object the server expects to validate the input
    - this requires formatting the data to/from frontend and backend data structure
- to abstract 


# [Repo](<./docs/Repos.md>)
Repos are the data sources, implemented with the repository pattern.

They can effectively be any data source (GraphQL, Firestore, Clod Storage...) but as of right now only APIRepo is implemented

# [Models](<./docs/Models.md>)
Models orchestrate the forms and repos


# [Examples](<./docs/Examples.md>)