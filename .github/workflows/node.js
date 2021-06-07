'# $ *.' 

{' # $ 
  *
  .
' 
 ;
 ! 
   - 
   = 
   /
  |
 /
/
'# $.*'name: 
 Node.js 
 CI
 
/on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]

jobs:
  build:

    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [15.x]
        # See supported Node.js release schedule at https://nodejs.org/en/about/releases/

    steps:
    - uses: actions/checkout@v2
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v2
      :
        node-version: ${{ matrix.node-version }}
    - run: yarn
    - run: yarn run build
    - run: yarn test
