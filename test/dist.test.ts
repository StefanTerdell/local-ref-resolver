import localRefResolver from "../dist";

describe("dist", () => {
  it("should work", () =>
    expect(
      localRefResolver({
        a: {
          $ref: "#/b",
        },
        b: "hello",
      })
    ).toStrictEqual({
      a: "hello",
      b: "hello",
    }));
});
