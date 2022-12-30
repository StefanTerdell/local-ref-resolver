import { localRefResolver } from "../src/localRefResolver";

describe("Local ref resolver", () => {
  it("Should be possible to filter out references", () => {
    const obj = {
      source: {
        nr: 1,
      },
      resolveThis: {
        $ref: "#/source",
      },
      notThis: {
        $ref: "#/source",
      },
    };

    const res = localRefResolver(obj, {
      refFilter: ([target]) => target === "#/resolveThis",
    });

    expect(res).toStrictEqual({
      source: { nr: 1 },
      resolveThis: { nr: 1 },
      notThis: { $ref: "#/source" },
    });
  });

  it.skip("should handle a self-replacing reference", () => {
    expect(
      localRefResolver({
        $ref: "#/x",
        x: "hello",
      })
    ).toStrictEqual("hello");
  });
});
