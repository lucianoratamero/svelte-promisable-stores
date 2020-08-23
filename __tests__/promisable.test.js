import { get } from "svelte/store";
import { promisable } from "../index";

describe("promisable", () => {
  it("throws if promiseFunction is not a function", async () => {
    expect(() => promisable()).toThrow(
      "The provided promiseFunction was not a function. It was undefined."
    );
    expect(() => promisable("not a function")).toThrow(
      "The provided promiseFunction was not a function. It was string."
    );
  });

  it("throws if shouldRefreshPromise is passed and not a function", async () => {
    expect(() => promisable(() => {}, "lala")).toThrow(
      "The provided shouldRefreshPromise was not a function. It was string."
    );
  });

  it("returns writable store with dispatch method", async () => {
    const testPromisable = promisable(() => {});
    expect(testPromisable.isPromisable).toBeTruthy();
    expect(typeof testPromisable.set).toBe("function");
    expect(typeof testPromisable.update).toBe("function");
    expect(typeof testPromisable.subscribe).toBe("function");
    expect(typeof testPromisable.dispatch).toBe("function");
  });

  it("calls promiseFunction when calling dispatch method passing args", async () => {
    const mockPromiseFunction = jest.fn(() => "testValue");
    const testPromisable = promisable(mockPromiseFunction);
    testPromisable.dispatch("arg1", "arg2");
    expect(mockPromiseFunction).toHaveBeenCalledWith("arg1", "arg2");
    expect(get(testPromisable)).toBe("testValue");
  });

  it("calls shouldRefreshPromise when calling dispatch method passing args", async () => {
    const mockShouldRefresh = jest.fn(() => true);
    const testPromisable = promisable(
      () => Promise.resolve("testValue"),
      mockShouldRefresh
    );

    testPromisable.dispatch("arg1", "arg2");
    await get(testPromisable);
    expect(mockShouldRefresh).toHaveBeenCalledWith(undefined, "arg1", "arg2");

    testPromisable.dispatch("arg1", "arg2");
    await get(testPromisable);
    expect(mockShouldRefresh).toHaveBeenCalledWith("testValue", "arg1", "arg2");
  });
});
