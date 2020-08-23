import { writable, get } from "svelte/store";
import { promisable, derivedPromisable } from "../index";

describe("derivedPromisable", () => {
  let testWritableStore;

  beforeEach(() => {
    testWritableStore = writable();
  });

  it("throws if promiseFunction is not a function", async () => {
    expect(() => derivedPromisable()).toThrow(
      "You should provide a store to derive from."
    );
    expect(() => derivedPromisable(testWritableStore)).toThrow(
      "The provided promiseFunction was not a function. It was undefined."
    );
    expect(() =>
      derivedPromisable(testWritableStore, "not a function")
    ).toThrow(
      "The provided promiseFunction was not a function. It was string."
    );
  });

  it("throws if shouldRefreshPromise is passed and not a function", async () => {
    expect(() =>
      derivedPromisable(testWritableStore, () => {}, "lala")
    ).toThrow(
      "The provided shouldRefreshPromise was not a function. It was string."
    );
  });

  it("returns writable store with dispatch method", async () => {
    const testPromisable = derivedPromisable(testWritableStore, () => {});
    expect(testPromisable.isPromisable).toBeTruthy();
    expect(typeof testPromisable.subscribe).toBe("function");
  });

  it("calls promiseFunction passing args when derived store changes", async () => {
    const mockPromiseFunction = jest.fn((value) => Promise.resolve(value));
    const testPromisable = derivedPromisable(
      testWritableStore,
      mockPromiseFunction
    );

    testWritableStore.set("testValue");
    await get(testPromisable);
    expect(mockPromiseFunction).toHaveBeenCalledWith("testValue");

    testWritableStore.set("testValue2");
    await get(testPromisable);
    expect(mockPromiseFunction).toHaveBeenCalledWith("testValue2");
  });

  it("does not calls promiseFunction if shouldRefreshPromise returns false", async () => {
    const mockPromiseFunction = jest.fn(() => "testValue");
    const testPromisable = derivedPromisable(
      testWritableStore,
      mockPromiseFunction,
      () => false,
    );
    testWritableStore.set("testValue");
    await get(testPromisable);
    expect(mockPromiseFunction).not.toHaveBeenCalled();
  });

  it("calls promiseFunction passing args when derived store changes for promisable store", async () => {
    const mockPromiseFunction = jest.fn((value) =>
    Promise.resolve(value));
    const testPromisableStore = promisable((value) =>
      Promise.resolve(value)
    );
    const testPromisable = derivedPromisable(
      testPromisableStore,
      mockPromiseFunction
    );

    testPromisableStore.dispatch("testValue");
    await get(testPromisableStore);
    await get(testPromisable);
    expect(mockPromiseFunction).toHaveBeenCalledWith("testValue");
  });

  it("calls shouldRefreshPromise when calling dispatch method passing args", async () => {
    const mockShouldRefresh = jest.fn(() => true);
    const testPromisable = derivedPromisable(
      testWritableStore,
      () => Promise.resolve("resolvedTestValue"),
      mockShouldRefresh
    );

    testWritableStore.set("testValue");
    await get(testPromisable);
    expect(mockShouldRefresh).toHaveBeenCalledWith(
      undefined,
      "testValue",
      undefined
    );

    testWritableStore.set("testValue2");
    await get(testPromisable);
    expect(mockShouldRefresh).toHaveBeenCalledWith(
      "resolvedTestValue",
      "testValue2",
      "testValue"
    );
  });
});
