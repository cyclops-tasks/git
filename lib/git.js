// Packages
import dotStoreLog from "@dot-store/log"
import dotStoreSpawn from "@dot-store/spawn"

// Helpers
import { resetArgv } from "./git/argv"
import { dryMode } from "./git/dry"
import { output } from "./git/output"

// Composer
export default function(options) {
  const { events, store } = options

  dotStoreLog({ events, output, store })
  dotStoreSpawn({ events, store })

  events.on({
    "before.cyclops.git-tasks.task": resetArgv,

    "cyclops.git-tasks.task": [
      dryMode,
      {
        if: [
          () => store.get("argv.cyclops.commit"),
          () => commit,
        ],
      },
      {
        if: [
          () => store.get("argv.cyclops.status"),
          () => status,
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

  const prefix = `cyclops.tasks.${taskId}`
  const command = "git"
  const options = { cwd: projectPath }

  if (all) {
    await events.spawn(`${prefix}.git.add`, {
      args: ["add", "."],
      command,
      options,
    })

    await events.spawn(`${prefix}.git.add`, {
      args: ["add", ".", "-u"],
      command,
      options,
    })
  }

  await events.spawn(`${prefix}.git.commit`, {
    args: ["commit", all ? "-a" : undefined, "-m", message],
    command,
    options,
  })

  if (push) {
    await events.spawn(`${prefix}.git.push`, {
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

async function status({ events, store, taskId }) {
  const { projectPath } = store.get(
    `cyclops.tasks.${taskId}`
  )

  const prefix = `cyclops.tasks.${taskId}`

  await Promise.all([
    events.spawn(`${prefix}.git.log`, {
      args: ["log", "-1", "--pretty=%B"],
      command: "git",
      options: { cwd: projectPath },
    }),
    events.spawn(`${prefix}.git.status`, {
      args: ["status", "-uno"],
      command: "git",
      options: { cwd: projectPath },
    }),
  ])

  const { out: outLog } = store.get(
    `spawn.${prefix}.git.log`
  )

  const { out: outStatus } = store.get(
    `spawn.${prefix}.git.status`
  )

  await Promise.all([
    store.set(
      `${prefix}.git.behind`,
      !!outStatus.match(/(ahead|behind)/)
    ),
    store.set(
      `${prefix}.git.dirty`,
      !outStatus.match(/nothing to commit/)
    ),
    store.set(
      `${prefix}.git.needsPublish`,
      !outLog.match(/[\d+]\.\d/)
    ),
  ])
}
