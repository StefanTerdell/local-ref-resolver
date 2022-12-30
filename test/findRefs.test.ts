import { findRefs } from "../src//findRefs";

describe("Find Refs", () => {
  it("Should work with sibling dependencies", () => {
    const refs = findRefs(
      {
        ett: {
          $ref: "#/två",
        },
        två: {
          $ref: "#/tre",
        },
        tre: {
          succe: true,
        },
      },
      [],
      "#"
    );

    expect(refs).toStrictEqual([
      ["#/ett", "#/tre"],
      ["#/två", "#/tre"],
    ]);
  });

  it("Should work with nested dependencies", () => {
    const refs = findRefs(
      {
        a: {
          b: {
            $ref: "#/a/c",
          },
          c: {
            $ref: "#/tre",
          },
        },
        tre: {
          succe: true,
        },
      },
      [],
      "#"
    );

    expect(refs).toStrictEqual([
      ["#/a/b", "#/tre"],
      ["#/a/c", "#/tre"],
    ]);
  });

  it("Should work with circular dependencies", () => {
    const refs = findRefs(
      {
        a: {
          b: {
            $ref: "#",
          },
        },
      },
      [],
      "#"
    );

    expect(refs).toStrictEqual([["#/a/b", "#"]]);
  });

  it("should handle a self-replacing reference", () => {
    expect(
      findRefs(
        {
          $ref: "#/x",
          x: "hello",
        },
        [],
        "#"
      )
    ).toStrictEqual([["#", "#/x"]]);
  });
});
