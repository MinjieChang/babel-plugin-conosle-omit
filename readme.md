# babel-plugin-console-omit

## introduction

a babel plugin that would remove `console` call exprssion in production mode

this primitive code with console:

```js
let a = b => {
  console.log(b)
};
let fn = c => { console.log(c)}
function code(x) {
  console.log(x)
  if (true) {
    console.log(x)
  }
  console.log(y)
  // return number
  return x * x
};
```

the transformed code like this：

```js
let a = b => {};
let fn = c => {}
function code(x) {
  if (true) {
  }
  // return number
  return x * x
};
```

of couse, You can add the following agreed comments if you would like to reserve some `console`

1. reserve
2. no remove
3. not remove

```js
let a = b => {
  /*
  * no remove
  * other comment
  */
  console.log(b)
};
let fn = c => { console.log(c)}
function code(x) {
  console.log(x) // reserve
  if (true) {
    // some comment
    console.log(x) // no remove
    // some comment
    console.log(x)
  }
  // ggggg
  console.log(x)
  // reserve
  console.log(y)
  // return number
  return x * x
};
```

the transformed code with some different comments

```js
let a = b => {
  /*
  * no remove
  * other comment
  */
  console.log(b);
};
let fn = c => {};
function code(x) {
  console.log(x); // reserve
  if (true) {
    // some comment
    console.log(x); // no remove
    // some comment
  }
  // ggggg

  // reserve
  console.log(y);
  // return number
  return x * x;
};
```
so you can see, The `console` statement will not be deleted with reserved comment. Instead, only with other comments will be deleted

## usage

install this plugin

```shell
npm i -D babel-plugin-console-omit
```
### used in .babelrc

add the plugin to `.babelrc` file

```js
{
  "plugins": [
    ["babel-plugin-console-omit"],
  ]
}
```

### used in webpack.config.js

```js
'module': {
  'loaders': [{
    'loader': 'babel-loader',
    'test': /\.js$/,
    'exclude': /node_modules/,
    'query': {
      'plugins': ['console-omit'],
      'presets': [['@babel/env', { 'targets': { 'node': 6 } }]]
    }
  }]
}
```