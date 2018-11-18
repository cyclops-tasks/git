import dotEvent from "dot-event"
import dotStore from "dot-store"
import dotTask from "dot-task"
import dotGit from "../dist/git"

let events, store

beforeEach(async () => {
  events = dotEvent()
  store = dotStore(events)

  dotTask({ events, store })

  events.onAny({
    "before.spawn": ({ event }) => {
      event.signal.cancel = true
    },
  })
})

async function run(...arg) {
  await events.task({
    arg,
    composer: dotGit,
    op: "git",
    path: `${__dirname}/fixture`,
  })
}

test("commit", async () => {
  const args = []

  events.onAny({
    "before.spawn": ({ event }) => args.push(event.args[0]),
  })

  await run("-a", "commit", "-m", "hi")

  expect(args).toEqual([
    {
      args: ["add", "."],
      command: "git",
      options: {
        cwd: `${__dirname}/fixture/project-a`,
      },
    },
    {
      args: ["add", ".", "-u"],
      command: "git",
      options: {
        cwd: `${__dirname}/fixture/project-a`,
      },
    },
    {
      args: ["commit", "-a", "-m", "hi"],
      command: "git",
      options: {
        cwd: `${__dirname}/fixture/project-a`,
      },
    },
    {
      args: ["push", "origin", "master"],
      command: "git",
      options: {
        cwd: `${__dirname}/fixture/project-a`,
      },
    },
  ])
})
