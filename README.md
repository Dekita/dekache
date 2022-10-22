[<img src="https://github.com/Dekita/dekache/blob/main/docgen/header.png" style="margin-top: 28px;">](https://dekitarpg.com/)
--------------------------------------------------------------------------------

# What is dekache? 
`dekache` is a simple cache module written by [DekitaRPG](https://dekitarpg.com) that allows you to easily get and set cache data.

## License TLDR
```MIT - Copyright (c) 2022 Dekita (dekitarpg@gmail.com)```
[[view license]](https://github.com/Dekita/dekache/blob/main/LICENSE)

## Documentation
[https://dekita.github.io/dekache/](https://dekita.github.io/dekache/)

## System Requirements
[node.js](https://nodejs.org/) 

## Author Information
[email](mailto://dekitarpg@gmail.com) | 
[website](https://dekitarpg.com/) | 
[twitter](https://twitter.com/dekitarpg) | 
[github](https://github.com/dekita/dekache/)

## How To Use This Module In Your Own Projects:
Assuming you already have a `node.js` project simply include the module in your desired file, create your cache container, and begin storing/fetching your data.

NOTE: each dekache instance creates an interval loop when created. this will keep your node.js application running. 

## Install dekache 
```
npm i dekache
```
## Require dekache
```js
const Dekache = require('dekache');
// OR
import Dekache from 'dekache';
```

## Create a cache container
```js
const mycache = new Dekache({
    // name: 'some-cache-id'
    // type: 'force' OR 'renew'
    // mins: mins to cache items
    // freq: cache update freq
})
```

## Get cache data
```js
// get data from cache matching 'some-item-id'.
// if it doesnt exist, then the callback function
// will run to initialize the cache data. 
const r1 = await mycache.get('some-item-id', async()=>{
    return 1; // initial data
});
// now returns 1 (until cached item gets cleared) 
const r2 = await mycache.get('some-item-id', async()=>{
    return 999; // function never called
});
```


## Full Example: 
```js
const Dekache = require('dekache');

const mycache = new Dekache({
    name:'you got any cache?', 
    mins: 0.1,
});

// listen for after cleared items
mycache.on('clear', (cache, stats) => {
    console.log(stats)
});

// listen for clearing each item
mycache.on('clear-item', (data, ikey) => {
    // ikey is the internal cache key for data..
    // use `mycache.key(id)` for any comparison checks 
    console.log('cleared-item:', data);
});

(async ()=>{
    const id = 'some-identifier';
    const r1 = await mycache.get(id, async() => 1);
    const r2 = await mycache.get(id, async() => 999);
    console.log(r1, r2, `is equal?: ${r1 === r2}`);
})();
```