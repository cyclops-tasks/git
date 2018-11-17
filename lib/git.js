// Packages
import dotStoreLog from "@dot-store/log"
import dotStoreSpawn from "@dot-store/spawn"

// Helpers
import { dryMode } from "./git/dry"
import { output } from "./git/output"
import { propsFn } from "./git/props"

// Composer
export default function(options) {
  const { events, store } = options

  if (events.ops.has("git")) {
    return options
  }

  dotStoreLog({ events, store })
  dotStoreSpawn({ events, store })

  events.onAny({
    git: [
      dryMode,
      async options => {
        const { action } = options

        if (actions[action]) {
          await actions[action](options)
        }
      },
    ],

    gitSetup: () =>
      events.argv("argv", {
        options: {
          alias: {
            a: ["action"],
            d: ["dry"],
            m: ["message"],
          },
        },
      }),

    store: output,
  })

  return options
}

export const actions = {
  commit: async function(options) {
    const { cwd, events, message } = options

    if (!message) {
      throw new Error("No message specified")
    }

    const command = "git"
    const props = propsFn(options)

    await events.spawn(props("gitCommit", "spawnAdd"), {
      args: ["add", "."],
      command,
      options: { cwd },
    })

    await events.spawn(
      props("gitCommit", "spawnAddUpdate"),
      {
        args: ["add", ".", "-u"],
        command,
        options: { cwd },
      }
    )

    await events.spawn(props("gitCommit", "spawnCommit"), {
      args: ["commit", "-a", "-m", message],
      command,
      options: { cwd },
    })

    await events.spawn(props("gitCommit", "spawnPush"), {
      args: ["push", "origin", "master"],
      command,
      options: { cwd },
    })
  },

  status: async function(options) {
    const { cwd, events, store } = options
    const command = "git"
    const props = propsFn(options)

    await Promise.all([
      events.spawn(props("gitStatus", "spawnLog"), {
        args: ["log", "-1", "--pretty=%B"],
        command,
        options: { cwd },
      }),
      events.spawn(props("gitStatus", "spawnStatus"), {
        args: ["status", "-uno"],
        command,
        options: { cwd },
      }),
    ])

    const { spawnLog, spawnStatus } = store.get(
      props("gitStatus")
    )

    await Promise.all([
      store.set(
        props("gitStatus", "behind", "result"),
        !!spawnStatus.out.match(/(ahead|behind)/)
      ),
      store.set(
        props("gitStatus", "dirty", "result"),
        !spawnStatus.out.match(/nothing to commit/)
      ),
      store.set(
        props("gitStatus", "needsPublish", "result"),
        !spawnLog.out.match(/[\d+]\.\d/)
      ),
    ])
  },
}
