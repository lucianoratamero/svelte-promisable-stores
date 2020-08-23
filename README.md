# svelte-promisable-stores

![Node.js CI](https://github.com/lucianoratamero/svelte-promisable-stores/workflows/Node.js%20CI/badge.svg)
![Coverage - branches](https://raw.githubusercontent.com/lucianoratamero/svelte-promisable-stores/master/badges/badge-branches.svg)
![Coverage - functions](https://raw.githubusercontent.com/lucianoratamero/svelte-promisable-stores/master/badges/badge-functions.svg)
![Coverage - lines](https://raw.githubusercontent.com/lucianoratamero/svelte-promisable-stores/master/badges/badge-lines.svg)
![Coverage - statements](https://raw.githubusercontent.com/lucianoratamero/svelte-promisable-stores/master/badges/badge-statements.svg)


This project contains a collection of stores to manage and save promises.

It's mostly used together with [svelte](https://svelte.dev/)'s [await blocks](https://svelte.dev/docs#await).

## API

### `promisable(promiseFunction: function, shouldRefreshPromise = () => true)`:

Extended `writable` stores.

Receives:

- `promiseFunction`: required, returns `Promise`. It expects a function that returns a promise (for example, a fetch or axios call);
- `shouldRefreshPromise`: optional, returns `Boolean`. It receives multiple arguments. The first is always the current data from its own resolved/rejected promise. The others are all the arguments passed to the `dispatch` method.

Returns:

- `subscribe, set, update`: directly from the embedded `writable` store;
- `dispatch`: this method calls the provided `promiseFunction` passing any arguments and saves inside the store its returned promise. If a `shouldRefreshPromise` function was provided, `dispatch` calls it before `promiseFunction` and, if it returns false, `promiseFunction` will not be called and the `promisable` store data won't change;
- `isPromisable`: always set to `true`. Only used internally on `derivedPromisable` stores, for a better developer experience (no `.then`s inside `shouldRefreshPromise`).


### `derivedPromisable(store, promiseFunction: function, shouldRefreshPromise = () => true)`:

Extended `derived` stores.

Receives:

- `store`: any svelte store, including `promisable`s;
- `promiseFunction`: required, returns `Promise`. It expects a function that returns a promise (for example, a fetch or axios call). `promiseFunction` is called with the provided store's data, whenever its data changes;
- `shouldRefreshPromise`: optional, returns `Boolean`. It receives multiple arguments. The first is always the current data from its own resolved/rejected promise. The others are all the arguments passed to the `dispatch` method.

Returns:

- `subscribe`: directly from the embedded `derived` store;
- `isPromisable`: always set to `true`. Only used internally on `derivedPromisable` stores, for a better developer experience (no `.then`s inside `shouldRefreshPromise`).

## TODO

- examples
