import { MutableRefObject } from "react";
import { act, cleanup, testHook } from "react-testing-library";
import useValueReset from "../useValueReset";

jest.useFakeTimers();

const setTimeout = window.setTimeout as jest.Mock<typeof window.setTimeout>;
const clearTimeout = window.clearTimeout as jest.Mock<
  typeof window.clearTimeout
>;

describe("useResetValueTimeout", () => {
  beforeEach(() => {
    setTimeout.mockClear();
    clearTimeout.mockClear();
  });

  afterEach(cleanup);

  it("should return the correct object", () => {
    let config;
    testHook(() => (config = useValueReset(null)));

    expect(config).toMatchObject({
      valueRef: { current: null },
      setValue: expect.any(Function),
      resetValue: expect.any(Function),
    });
  });

  it("should trigger a timeout when the setter function is called", () => {
    let valueRef: MutableRefObject<string> = { current: "" };
    let setValue: (v: string) => void;
    testHook(() => ({ valueRef, setValue } = useValueReset("", 500)));

    expect(valueRef.current).toBe("");
    expect(setTimeout).not.toBeCalled();
    expect(clearTimeout).not.toBeCalled();

    act(() => {
      setValue("hello");
    });

    expect(valueRef.current).toBe("hello");
    expect(setTimeout).toBeCalledTimes(1);
    expect(clearTimeout).toBeCalledTimes(1);
    expect(setTimeout.mock.calls[0][1]).toBe(500);

    jest.runOnlyPendingTimers();
    expect(valueRef.current).toBe("");
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(clearTimeout).toBeCalledTimes(2);
  });

  it("should reset the timeout if the setValue is triggered again before the timeout finishes", () => {
    let valueRef: MutableRefObject<string> = { current: "" };
    let setValue: (v: string) => void;
    testHook(() => ({ valueRef, setValue } = useValueReset("", 500)));

    act(() => {
      setValue("hello");
    });

    expect(setTimeout).toBeCalledTimes(1);
    expect(clearTimeout).toBeCalledTimes(1);
    expect(valueRef.current).toBe("hello");

    act(() => {
      setValue("hello, world!");
    });

    expect(setTimeout).toBeCalledTimes(2);
    expect(clearTimeout).toHaveBeenCalledTimes(2);
    expect(valueRef.current).toBe("hello, world!");
  });
});
