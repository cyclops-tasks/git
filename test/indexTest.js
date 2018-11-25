// Packages
import dotEvent from "dot-event"
import dotTask from "@dot-event/task"

// Helpers
import dotGit from "../dist/git"

// Constants
const cancel = ({ event }) => (event.signal.cancel = true)

// Variables
let events

// Tests
beforeEach(async () => {
  events = dotEvent()

  dotGit({ events })
  dotTask({ events })

  events.onAny({
    "before.spawn": cancel,
  })
})

async function run(...argv) {
  await events.task({
    argv,
    op: "git",
    path: `${__dirname}/fixture`,
  })
}

test("commit", async () => {
  const args = []

  events.onAny({
    "before.spawn": ({ event }) => args.push(event.args[0]),
  })

  await run("--commit", "-m", "hi")

  expect(args).toEqual([
    {
      args: ["add", "."],
      command: "git",
      cwd: `${__dirname}/fixture/project-a`,
    },
    {
      args: ["add", ".", "-u"],
      command: "git",
      cwd: `${__dirname}/fixture/project-a`,
    },
    {
      args: ["commit", "-a", "-m", "hi"],
      command: "git",
      cwd: `${__dirname}/fixture/project-a`,
    },
    {
      args: ["push", "origin", "master"],
      command: "git",
      cwd: `${__dirname}/fixture/project-a`,
    },
  ])
})
