# draft

This is a draft for a tool providing a way listen the DOM mutations, dealing with the asynchronous generators.


## Goals

The idea is to be able
* to store some values, related to a node & be able to cleanup these values when the node is removed from a target
* to refresh the values on a move
* to save some nodes, when they are removed, whatever the way or whatever where they are currently nested (like by a content replacement in an AJAX navigation) without to have to create a strong relationship between our components
* **SOON** to deal with the attributes mutations as iterations... doesn't it seem natural?
* to easily make some other custom behaviors based on its `mutations()`

[First minimal demo](https://lcfvs.github.io/draft/)

## API

### mutations

The core function,

```js
async* mutations(node, target, mapper, options)
```
* `node`: the node to listen, into the target scope
* `target`: the target to observe with the `MutationObserver`
* `mapper(records, matches)`: a function returning an iterable containing the values to iterate
  * `records`: an array of `MutationRecords`
  * `matches(current)`: a function to test if a record node is the listened one
    * `current`: the node to test
* `options`: the `mutationObserver.observe()` options


### moves

```js
async* moves(node, target = node.ownerDocument, subtree = true)
```
* `node`: the node to listen, into the target scope
* `target`: the target to observe with the `MutationObserver`
* `subtree`: the `mutationObserver.observe()` `subtree` option

The possible iteration is a boolean, indicating if the node is current somewhere into the target
