# run-async-gen
Utility function for running asynchronous JavaScript generators

## Install
```bash
npm install run-async-gen --save
```

## API

### ``runAsyncGen(iter, cb)``
* ``iter`` [iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators) created by ``asyncGen``
* ``cb(err, result)`` callback is called when ``asynGen`` throw an exception ``err`` or return a value ``result``

###``asyncGen conventions``
Asynchronous [generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators) should yield asynchronous function with one callback parameter ``asyncFunc(cb)``, this convention follows most of Node.js API. If your ``asyncFunc`` requires more than one parameter, you can bind this parameters using [lodash](https://github.com/lodash/lodash) utility functions, such as [``bind``](https://lodash.com/docs#bind), [``partial``](https://lodash.com/docs#partial) and [``partialRight``](https://lodash.com/docs#partialRight).  The provided callback ``cb(err, result)`` should be called with one of two arguments ``err`` or ``result``. If ``err`` is not ``null`` or ``undefined`` ``yield`` statement will throw exception with this value, it can be handled using standatrd ``try-catch`` statements. If no ``error``, ``yield`` statement will return ``result``.

To run a number of asynchronous functions in parallel, you can pass to ``yield`` statement an array of asynchronous functions ``[asyncFn1, asyncFun2]``, then yield will return their results as an array in same order ``['result1', 'result2']``.

## Example
```js
'use strict';

const _ = require('lodash');
const fs = require('fs');
const runAsyncGen = require('run-async-gen');

function* testAsyncGen(delay, times) {
  console.log('begin');
  for (let i = 0; i < times; i++) {
    console.log('Wait', i);
    console.log('Stats', yield _.bind(fs.readFile, fs, '/proc/uptime')); 
    yield _.partialRight(setTimeout, delay);
  }
  console.log('end');
  if (Math.random() > 0.5) {
    throw new Error('Error :(');
  }
  return 'test result';
}

runAsyncGen(testAsyncGen(1000, 4), function(err, result) {
  if (err) {
    console.error('Error', err);
    return;
  }
  console.log('Result', result);
});

runAsyncGen(testAsyncGen(2000, 2), function(err, result) {
  if (err) {
    console.error('Error', err);
    return;
  }
  console.log('Result', result);
});

```
