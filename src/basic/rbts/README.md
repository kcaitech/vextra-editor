# https://github.com/nalply/rbts.git

# Red-Black Tree in Typescript

[![Red Black Tree SVG](https://upload.wikimedia.org/wikipedia/commons/1/10/Red-black_tree_example_nN.svg)](https://en.wikipedia.org/wiki/Red%E2%80%93black_tree)

[![npm Version](https://badge.fury.io/js/rbts.svg)](https://badge.fury.io/js/rbts)
[![Dependencies](https://david-dm.org/nalply/rbts.svg)](https://david-dm.org/nalply/rbts)
[![Dev Dependencies](https://david-dm.org/nalply/rbts/dev-status.svg)](https://david-dm.org/nalply/rbts?type=dev)
[![Build](https://travis-ci.com/nalply/rbts.svg?branch=master)](https://travis-ci.com/nalply/rbts)
[![Code Coverage](https://codecov.io/gh/nalply/rbts/branch/master/graph/badge.svg)](https://codecov.io/gh/nalply/rbts)

A red-black tree is a data structure for sorted storage of key-value pairs.
Items are stored in tree nodes and sorted after a criterium (`LessOp`).
Search, insertion, deletion and traversal are performed in $O(\log n)$ time.
This implementation has the same interface as JavaScript's built-in type
`Map`, so it can be used as replacement for `Map`, however iteration is
sorted according to the `lessOp` parameter in the constructor.

The implementation seems to be rather efficient. I had a short stint with
profiling. Adding a million entries with a case-insensitive sort using
`(a, b) => a.toUpperCase() < b.toUpperCase()` needed 5 seconds on my MacBook
Air 13inch early 2015. About half of that was inside C++ (internal String to
uppercase) and the other half in JavaScript, and of that about 7% in the
raw insert of the tree. I am no expert but this seems good to me. Have
a look at the [profiler's output here](https://github.com/nalply/rbts/blob/profile-stint/profile.txt).

## Documentation

Is in the directory [docs](docs/README.md). (Something went wrong with
typedoc's Markdown theme and I had to fix it manually for the moment, and
because I am not a robot  there might be broken links and other mistakes.)

## Example

```typescript
import { Tree } from 'rbts'

interface Person { name: string, age: number }

const store = new Tree<string, Person>(
  [
    [ 'bDe7', { name: 'Jane Doe', age: 47 } ],
    [ 'O3lE', { name: 'John Doe', age: 46 } ],
    [ 'fX4z', { name: 'Billy Brown', age: 33 } ],
    [ 'Tuac', { name: 'Vera Brown', age: 30 } ],
    [ '5S0o', { name: 'Zoe Brown', age: 8 } ],
  ], (a, b) => a.toUpperCase() < b.toUpperCase(),
)

// tslint:disable: no-console

// 30
console.log(store.get('Tuac')!.age)

// Zoe Brown
// Jane Doe
// Billy Brown
// John Doe
// Vera Brown
for (const person of store.values())
  console.log(person.name)

// true
console.log(store.delete('bDe7'))

// false
console.log(store.delete('bDe7'))

// false
console.log(store.delete('TUAC'))

// 4
console.log(store.size)
```
