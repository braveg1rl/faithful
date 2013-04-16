# Faithful [![Build Status](https://travis-ci.org/meryn/faithful.png?branch=master)](https://travis-ci.org/meryn/faithful)

Like [Async](https://github.com/caolan/async), but employing promises.

### Collection functions

* `each`, `eachSeries`
* `map`, `mapSeries`
* `reduce`
* `detect`, `detectSeries` 
* `filter`, `filterSeries`

### Utility functions

* `log`
* `dir`

## Usage

Faithful mimics the [Async](https://github.com/caolan/async) API, with three important differences:

* The functions don't have a callback argument
* The functions return a [Promises/A+](http://promises-aplus.github.io/promises-spec/) promise (powered by [RSVP.js](https://github.com/tildeio/rsvp.js))
* The iterator is not passed a callback argument. Instead, an iterator is expected to return a promise. If the iterator throws an error or does not return a promise-like object (i.e. it does not have a `then` method), then the promise returned by the function will fail.

### faithful.each

```coffee
faithful.each(inputs, iterator)
  .then ->
    console.log "Everything has executed."
  .then null, (error) ->
    console.error error
```

`faithful.eachSeries` works the same, but ensures the iterator is not called with the next argument until the promise returned by the previous iterator has resolved.

`each` and `eachSeries` are also available as `forEach` and `forEachSeries`, respectively.

### faithful.map

```coffee
faithful.map(inputs, iterator)
  .then (outputs) ->
    console.log outputs
  .then null, (error) ->
    console.error error
```

`faithful.mapSeries` works the same, but ensures the iterator is not called with the next argument until the promise returned by the previous iterator has resolved.

### faithful.reduce

The iterator for `reduce` works a little differently than the regular iterators. In line with `Array.reduce` and `Async.reduce, the iterator takes the current reduction as its first argument, and the current value to be processed as the second. The returned promise must resolve with the new value for the reduction.

On top of that, the reduce function takes an extra argument (in the middle). This specifies the initial value of the reduction.

The example below is a pretty involved way of computing the factorial of 4 (i.e. `4 * 3 * 2 * 1`). Note that in this code, it's actually computed as `1 * 1 * 2 * 3 * 4`. The first `1` is the initial value passed. 

```coffee
iterator = (reduction, value) ->
  promise = new RSVP.Promise
  setImmediate ->
    promise.resolve reduction * value
  promise
faithful.reduce([1,2,3,4], 1, iterator)
  .then (reduction) ->
    console.log reduction # 4! == 24
  .then null, (error) ->
    console.error error
```

By necessity, `faithful.reduce` does its processing serially. The value of the reduction after a particular step `i` must be known before the next step can be executed. When possible, it's advisable to first get an array of values in a parallel fashion (for example by employing `faithful.map`) and then calling `reduce` on the resulting array.

### faithful.detect

```coffee
faithful.detect(inputs, iterator)
  .then (firstMatchingInput) ->
    if firstMatchingInput?
      console.log firstMatchingInput
    else
      console.log "No input matched the criteria."
  .then null, (error) ->
    console.error error
```

`faithful.detect` gives as result the first input value for which the promises returned by the iterator resolved to a truthy value (i.e. something that evalates to `true` in context of an if-statement). If no input value matched the criteria set by the iterator, then the result will be `undefined`.

Because `faithful.detect` starts with calling the iterator once for each value in the `inputs array - before any of the promises returned have resolved -, the result you'll get from `detect` will not necessarily be the first value inside the input array that matches the criteria set by the iterator. Rather, it's the result for which the promise returned by the iterator happened to resolve first. Because of that, you may want to use `detectSeries` so that inputs are checked one by one, in order. With `detectSeries` you'll always get back the first among the inputs that matched the criteria.

### faithful.log

`faithful.log` logs the resolution value of the promise using `console.log`, and the failure value with `console.error` otherwise.

### faithtful.dir

`faithful.log` logs the resolution value of the promise using `console.dir`, and the failure value with `console.error` otherwise.


## Under the hood

All collection functions of Faithful are powered by two functions that do most of the work: `faithful.each` and `faithful.eachSeries`.

Both `faithful.each` and `faithful.eachSeries` take the following arguments: `values`, `iterator` and an optional `options` object. This options object allows you to configure the iteration process. Look at it as a configurable loop. All options are optional.

### Implementation of faithful.reduce

To get a sense of how you can build something quickly which is not implemented by Faithful yet, take a look at how the `Faithful.reduce` is implemented.

```coffee
faithful.reduce = (values, reduction, iterator) ->
  faithful.eachSeries values, ((value) -> iterator reduction, value),
    handleResult: (result) -> reduction = result
    getFinalValue: -> reduction
```

#### Things of note

* The iterator passed to `map` must be slightly adapter before being passed to `eachSeries`, because `eachSeries` calls the iterator with only the a value from the values array, while the iterator passed to `map` also takes a `reduction` argument (as it's first argument). 
* `handleResult` is called for every promise that resolves. In this case, the result is assigned to the local `reduction` variable (note its listes in the `reduce` function arguments).
* When every promise has resolved, the promise that `eachSeries` returns gets resolved with the value returned by `getFinalValue`.

### Implementation of faithful.detect

```coffee
faithful.detect = (values, iterator) ->
  found = false
  foundValue = undefined
  faithful.each values, iterator,
    handleResult: (result, index) -> 
      return unless result # did iterator find a match?
      foundValue = values[index] # look up the value that made the iterator match
      found = true # remember that we found something
    getFinalValue: -> foundValue # let promise resolve with the found value
    stopEarly: -> found # stop the processing when we found something
```

#### Things of note

* In contrast to the implementation of `faithful.map`, here the iterator gets passed on unchanged to `faithful.each`.
* `handleResult` takes a second argument `index`, which is the array index for the value that resulted in the current result. Here, the index is used to look up the original input value for the index, and set that as `foundValue`.
* When you provide a `stopEarly` function, you can cause the processing to stop before it would otherwise have. Here, we're done as soon as we've found a value. Noe that in case of `each`, the iterator will already have been called with all the values in the array, so only processing of results will stop. In case of `eachSeries`, it will prevent any further calls to `iterator`.

### Use with caution

The specifics of the `options` object may well change in the future. However, I think it's too useful not to share.

## Credits

The initial structure of this module was generated by [Jumpstart](https://github.com/meryn/jumpstart), using the [Jumpstart Black Coffee](https://github.com/meryn/jumpstart-black-coffee) template.

[Async](https://github.com/caolan/async) by [Caolan McMahon](http://caolanmcmahon.com) is of course the big inspiration for this project. It's an absolute work horse, and it does it job without fuzz.

## License

Faithful is released under the [MIT License](http://opensource.org/licenses/MIT).  
Copyright (c) 2013 Meryn Stol  