import * as lib from "../dist/git"

test("export something", () => {
  expect(Object.keys(lib).length).toBeGreaterThan(0)
})
