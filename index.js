import { writable, derived, get } from 'svelte/store';

export function promisable(promiseFunction, shouldRefreshPromise = () => true) {
  if (!promiseFunction || typeof promiseFunction !== "function") {
    throw new Error(
      `The provided promiseFunction was not a function. It was ${typeof promiseFunction}.`
    );
  }
  if (shouldRefreshPromise && typeof shouldRefreshPromise !== "function") {
    throw new Error(
      `The provided shouldRefreshPromise was not a function. It was ${typeof shouldRefreshPromise}.`
    );
  }

  const store = writable();
  const { set } = store;
  const getCurrentState = () => get(store);

  const dispatch = (...args) => {
    const currentState = getCurrentState(store);
    const createPromise = (currentStateData) => {
      if (shouldRefreshPromise(currentStateData, ...args))
        set(promiseFunction(...args));
    };

    if (currentState) {
      // since the last promise could have been rejected,
      // we should let shouldRefreshPromise decide to initiate it again or not
      currentState.then(createPromise).catch(createPromise);
    } else {
      createPromise();
    }
  };

  store.isPromisable = true;

  return {
    ...store,
    dispatch,
  };
}

export function derivedPromisable(
  derivedStore,
  promiseFunction,
  shouldRefreshPromise = () => true
) {
  if (!derivedStore)
    throw new Error('You should provide a store to derive from.');
  if (!promiseFunction || typeof promiseFunction !== "function") {
    throw new Error(
      `The provided promiseFunction was not a function. It was ${typeof promiseFunction}.`
    );
  }
  if (shouldRefreshPromise && typeof shouldRefreshPromise !== "function") {
    throw new Error(
      `The provided shouldRefreshPromise was not a function. It was ${typeof shouldRefreshPromise}.`
    );
  }

  let previousDerivedState;

  const store = derived(derivedStore, ($derivedStore, set) => {
    const currentState = getCurrentState();
    const createPromise = (currentStateData) => {
      if (
        shouldRefreshPromise(
          currentStateData,
          $derivedStore,
          previousDerivedState,
        )
      ) {
        if ($derivedStore && derivedStore.isPromisable) {
          $derivedStore.then((data) => set(promiseFunction(data)));
        } else {
          set(promiseFunction($derivedStore));
        }
        previousDerivedState = get(derivedStore);
      }
    };

    if (currentState) {
      // since the last promise could have been rejected,
      // we should let shouldRefreshPromise decide to initiate it again or not
      currentState.then(createPromise).catch(createPromise);
    } else {
      createPromise();
    }
  });

  const getCurrentState = () => get(store);
  store.isPromisable = true;

  return store;
}
