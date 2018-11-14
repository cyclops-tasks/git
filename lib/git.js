// Packages
import dotStoreLog from "@dot-store/log"
import dotStoreSpawn from "@dot-store/spawn"

// Helpers
import { resetArgv } from "./git/argv"
import { dryMode } from "./git/dry"

// Composer
export default function(options) {
  const { events, store } = options

  dotStoreLog({ events, store })
  dotStoreSpawn({ events, store })

  events.on({
    "cyclops.git-tasks.beforeTask": resetArgv,

    "cyclops.git-tasks.task": [
      dryMode,
      {
        if: [
          () => store.get("argv.cyclops.commit"),
          () => commit,
        ],
      },
    ],
  })

  return options
}

async function commit({ events, store, taskId }) {
  const { all, message, push } = store.get("argv.cyclops")

  const { projectPath } = store.get(
    `cyclops.tasks.${taskId}`
  )

  if (!message) {
    throw new Error("No message specified")
  }

  const command = "git"
  const options = { cwd: projectPath }

  if (all) {
    await events.spawn("git.add", {
      args: ["add", "."],
      command,
      options,
    })

    await events.spawn("git.add", {
      args: ["add", ".", "-u"],
      command,
      options,
    })
  }

  await events.spawn("git.commit", {
    args: ["commit", all ? "-a" : undefined, "-m", message],
    command,
    options,
  })

  if (push) {
    await events.spawn("git.push", {
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
