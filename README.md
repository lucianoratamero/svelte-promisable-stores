# svelte-promisable-stores

![Node.js CI](https://github.com/lucianoratamero/svelte-promisable-stores/workflows/Node.js%20CI/badge.svg)
![Coverage - branches](https://raw.githubusercontent.com/lucianoratamero/svelte-promisable-stores/master/badges/badge-branches.svg)
![Coverage - functions](https://raw.githubusercontent.com/lucianoratamero/svelte-promisable-stores/master/badges/badge-functions.svg)
![Coverage - lines](https://raw.githubusercontent.com/lucianoratamero/svelte-promisable-stores/master/badges/badge-lines.svg)
![Coverage - statements](https://raw.githubusercontent.com/lucianoratamero/svelte-promisable-stores/master/badges/badge-statements.svg)


This project contains a collection of stores to manage and save promises.

It's mostly used together with [svelte](https://svelte.dev/)'s [await blocks](https://svelte.dev/docs#await).

If you're using it to fetch data from a backend API, try using [`axios`](https://www.npmjs.com/package/axios), since [`fetch` does not trigger `catch` for 4xx/5xx responses](https://github.com/whatwg/fetch/issues/18).

## Installing

`npm install --save-dev svelte-promisable-stores`

**Note:** we recommend using `--save-dev` instead of `--save` to enable better SSR support (mostly for [Sapper](https://sapper.svelte.dev/)).

## Examples

### `promisable`

```js
// stores.js
import axios from 'axios';
import { promisable } from 'svelte-promisable-stores';

// promiseFunction: function that returns a promise
const fetchPerson = (personId) =>
  axios
    .get(`//jsonplaceholder.typicode.com/users/${personId}`)
    .then((response) => response.data);

export const currentPerson = promisable(
  fetchPerson,
  // shouldRefreshPromise: function that evaluates if
  // promise should be refreshed when `dispatch` is called.
  // In this case, it fetches a person's data
  // if there is no data for the store or
  // if it's id is different from the one passed to `dispatch`.
  (currentStateData, personId) =>
    !currentStateData || personId != currentStateData.id
);
```

```svelte
<!-- Person.svelte -->
<script>
  import { onMount } from 'svelte';
  import { currentPerson } from './stores';

  export let personId;

  onMount(() => {
    currentPerson.dispatch(personId);
  });
</script>

{#if $currentPerson}
  {#await $currentPerson}
    <p>Loading...</p>
  {:then $currentPerson}
    <dl>
      {#each $currentPerson as person}
        <dt>Name:</dt>
        <dd>{person.name}</dd>

        <dt>Email:</dt>
        <dd>{person.email}</dd>
      {/each}
    </dl>
  {:catch $currentPerson}
    <h1>Person not found</h1>
  {/await}
{/if}
```

### `derivedPromisable`

```js
// stores.js
import axios from 'axios';
import { writable } from 'svelte/store';
import { derivedPromisable } from 'svelte-promisable-stores';

export const searchTerm = writable('');

const fetchPeopleByName = ($searchTerm) =>
  axios
    .get(`//jsonplaceholder.typicode.com/users?q=${$searchTerm}`)
    .then((response) => response.data);

export const people = derivedPromisable(
  searchTerm, // <- store to derive data from
  fetchPeopleByName, // <- function that returns a promise
  // shouldRefreshPromise: same as the `promisable` one
  (currentStateData, $searchTerm, previousSearchTerm) =>
    $searchTerm && $searchTerm !== previousSearchTerm
);

```

```svelte
<!-- SearchPeopleByName.svelte -->
<script>
  import {searchTerm, people} from './store';
  let timer;

  // debouncing is always a good idea :]
  function handleKeyup(value){
    clearTimeout(timer);
    timer = setTimeout(() => searchTerm.set(value), 500);
  }
</script>

<div>
  <input type="text" value={$searchTerm} on:keyup={e => handleKeyup(e.target.value)} />
</div>

{#if $searchTerm}
  {#await $people}
    <p>Searching...</p>
  {:then $people}
    {#each $people as person}
      <a rel="preload" href="/person/{person.id}">
        <h1>Name: {person.name}</h1>
      </a>
    {/each}
  {:catch $people}
    <h1>ohno, something wrong isn't right! here's ther error:</h1>
    <p>{JSON.stringify($people)}</p>
  {/await}
{/if}
```

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

- codesandbox link
