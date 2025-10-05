// src/__tests__/simple.test.tsx
describe("Simple Tests", () => {
  it("should pass basic math test", () => {
    expect(2 + 2).toBe(4);
  });

  it("should pass string test", () => {
    expect("hello").toBe("hello");
  });

  it("should pass array test", () => {
    const arr = [1, 2, 3];
    expect(arr.length).toBe(3);
  });

  it("should pass object test", () => {
    const obj = { name: "test" };
    expect(obj.name).toBe("test");
  });
});
