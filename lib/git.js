import dotStoreLog from "@dot-store/log"
import dotStoreSpawn from "@dot-store/spawn"

import { dryMode } from "./dry"

export default function(options) {
  const { events, store } = options

  dotStoreLog({ events, store })
  dotStoreSpawn({ events, store })

  events.on({
    "cyclops.beforeRunTasks": async () =>
      await store.set("argvOptions.alias", {
        a: ["all"],
        c: ["commit"],
        d: ["dry"],
        m: ["message"],
        p: ["push"],
      }),

    "cyclops.startTask": [
      dryMode,
      {
        if: [() => store.get("argv.commit"), () => commit],
      },
    ],
  })

  return options
}

async function commit({ events, store, taskId }) {
  const { all, message, push } = store.get("argv")
  const { projectPath } = store.get(`tasks.${taskId}`)

  if (!message) {
    throw new Error("No message specified")
  }

  const command = "git"
  const options = { cwd: projectPath }

  if (all) {
    await events.spawn("add", {
      args: ["add", "."],
      command,
      options,
    })

    await events.spawn("add", {
      args: ["add", ".", "-u"],
      command,
      options,
    })
  }

  await events.spawn("commit", {
    args: ["commit", all ? "-a" : undefined, "-m", message],
    command,
    options,
  })

  if (push) {
    await events.spawn("push", {
      args: [
        "push",
        "origin",
        typeof push === "string" ? push : "master",
      ],
      command,
      options,
    })
  }
}
