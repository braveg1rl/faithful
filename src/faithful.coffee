RSVP = require "rsvp"
  
module.exports = faithful = {}

faithful.each = faithful.forEach = (values, func) -> 
  # this effectively works like "map", but it will do for now
  try
    eachPromise = RSVP.all (func value for value in values)
  catch error
    faithful.throw error
  
faithful.eachSeries = faithful.forEachSeries = (values, func) ->
  # Algorithm from
  # http://blog.jcoglan.com/2013/03/30/ ...
  # callbacks-are-imperative-promises-are-functional-nodes-biggest-missed-opportunity/
  # iterator = (currentPromise, value) -> currentPromise.then -> func value
  # return values.reduce iterator, faithful.return() # I don't understand this code yet
  i = 0
  promise = new RSVP.Promise
  iterate = ->
    if i >= values.length
      promise.resolve() 
    else
      try 
        localPromise = func(values[i])
      catch err
        return promise.reject err
      try
        localPromise.then (-> iterate()), ((err) -> promise.reject err)
      catch error
        promise.reject error
      i++
  iterate()
  promise

faithful.map = (values, func) ->
  try
    mapPromise = RSVP.all (func value for value in values)
  catch error
    faithful.throw error

faithful.mapSeries = (inputs, func) ->
  i = 0
  promise = new RSVP.Promise
  outputs = []
  iterate = ->
    if i >= inputs.length
      promise.resolve outputs 
    else
      try 
        localPromise = func(inputs[i])
      catch err
        return promise.reject err
      try
        localPromise
          .then (output) ->
            outputs.push output # this works because individual promises resolve in order
            iterate()
          .then null, (err) -> promise.reject err
      catch error
        promise.reject error
      i++
  iterate()
  promise
  
faithful.return = (value) -> # returns a promise which resolves to value
  promise = new RSVP.Promise
  promise.resolve value
  promise

faithful.throw = (error) -> # returns a promise which rejects with error
  promise = new RSVP.Promise
  promise.reject error
  promise
  
faithful.reduce = (values, func) ->
  