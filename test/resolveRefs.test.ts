import { resolveRefs } from "../src/resolveRefs";

describe("Resolving refs without merging", () => {
  it("Should work with sibling dependencies", () => {
    const obj = {
      ett: {
        $ref: "#/två",
      },
      två: {
        $ref: "#/tre",
      },
      tre: {
        succe: true,
      },
    };
    const refs: any = [
      ["#/ett", "#/tre"],
      ["#/två", "#/tre"],
    ];

    resolveRefs(obj, refs);

    expect(obj.ett).toBe(obj.tre);
    expect(obj.två).toBe(obj.tre);
  });

  it("Should work with nested dependencies", () => {
    const obj = {
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
    };
    const refs: any = [
      ["#/a/b", "#/tre"],
      ["#/a/c", "#/tre"],
    ];

    resolveRefs(obj, refs);

    expect(obj.a.b).toBe(obj.tre);
    expect(obj.a.c).toBe(obj.tre);
  });

  it("Should work with circular dependencies", () => {
    const obj = {
      a: {
        b: {
          $ref: "#",
        },
      },
    };

    const refs: any = [["#/a/b", "#"]];

    resolveRefs(obj, refs);

    const itWorks = Object.is(obj.a.b, obj);
    expect(itWorks).toBeTruthy();
  });

  it.skip("should handle a self-replacing reference", () => {
    expect(
      resolveRefs(
        {
          x: "hello",
        },
        [["#", "#/x"]]
      )
    ).toStrictEqual("hello");
  });
});

describe("Resolving refs with merging", () => {
  it("Should work with sibling dependencies", () => {
    const obj = {
      ett: {
        hej: 1,
        $ref: "#/två",
      },
      två: {
        hej: 2,
        $ref: "#/tre",
      },
      tre: {
        succe: true,
      },
    };
    const refs: any = [
      ["#/ett", "#/tre"],
      ["#/två", "#/tre"],
    ];

    resolveRefs(obj, refs, { merge: true });

    expect(obj.ett).toStrictEqual({ hej: 1, ...obj.tre });
    expect(obj.två).toStrictEqual({ hej: 2, ...obj.tre });
  });

  it("Should work with nested dependencies", () => {
    const obj = {
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
    };
    const refs: any = [
      ["#/a/b", "#/tre"],
      ["#/a/c", "#/tre"],
    ];

    resolveRefs(obj, refs, { merge: true });

    expect(obj.a.b).toStrictEqual(obj.tre);
    expect(obj.a.c).toStrictEqual(obj.tre);
  });

  it("Should work with replacing $ref", () => {
    const obj = {
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
    };

    const refs: any = [
      ["#/a/b", "#/tre"],
      ["#/a/c", "#/tre"],
    ];

    resolveRefs(obj, refs, { merge: true, keepRefs: "pelle" });

    expect(obj.a.b).toStrictEqual({ succe: true, pelle: "#/a/c" });
    expect(obj.a.c).toStrictEqual({ succe: true, pelle: "#/tre" });
  });

  it("Should work with circular dependencies", () => {
    const obj = {
      root: "yes",
      a: {
        b: {
          flag: "yep",
          $ref: "#",
        },
      },
    };

    const refs: any = [["#/a/b", "#"]];

    resolveRefs(obj, refs, { merge: true });

    // @ts-expect-error
    expect(obj.a.b.root).toBe(obj.root);
    expect(obj.a.b.flag).toEqual("yep");

    // console.log(util.inspect(obj, { depth: 9 }));
  });
});

describe("Pre-resolved references", () => {
  it("x", () => {
    expect(
      resolveRefs({ x: null }, [["#/x", "asdf"]], {
        resolved: {
          asdf: "hello",
        },
      })
    ).toStrictEqual({ x: "hello" });
  });
});
