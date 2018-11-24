// Packages
import { argvRelay } from "@dot-event/argv"
import dotLog from "@dot-event/log"
import dotSpawn from "@dot-event/spawn"

// Helpers
import { dryMode } from "./git/dry"
import { output } from "./git/output"

// Composer
export default function(options) {
  const { events, store } = options

  if (events.ops.has("git")) {
    return options
  }

  dotLog({ events, store })
  dotSpawn({ events, store })

  events
    .withOptions({
      cwd: process.cwd(),
    })
    .onAny({
      git: argvRelay,

      gitCommit: [
        dryMode,
        async function(options) {
          const { cwd, events, message, props } = options

          if (!message) {
            throw new Error("No message specified")
          }

          const command = "git"

          await events.spawn(
            [...props, "gitCommit", "add"],
            {
              args: ["add", "."],
              command,
              cwd,
            }
          )

          await events.spawn(
            [...props, "gitCommit", "addUpdate"],
            {
              args: ["add", ".", "-u"],
              command,
              cwd,
            }
          )

          await events.spawn(
            [...props, "gitCommit", "commit"],
            {
              args: ["commit", "-a", "-m", message],
              command,
              cwd,
            }
          )

          await events.spawn(
            [...props, "gitCommit", "push"],
            {
              args: ["push", "origin", "master"],
              command,
              cwd,
            }
          )
        },
      ],

      gitSetup: () =>
        events.argv({
          alias: {
            a: ["action"],
            c: ["commit"],
            d: ["dry"],
            m: ["message"],
            s: ["status"],
          },
        }),

      gitStatus: async function(options) {
        const { cwd, events, props, store } = options
        const command = "git"

        await Promise.all([
          events.spawn([...props, "gitStatus", "log"], {
            args: ["log", "-1", "--pretty=%B"],
            command,
            cwd,
          }),
          events.spawn([...props, "gitStatus", "status"], {
            args: ["status", "-uno"],
            command,
            cwd,
          }),
        ])

        const { spawnLog, spawnStatus } = store.get([
          ...props,
          "gitStatus",
        ])

        await Promise.all([
          store.set(
            [...props, "gitStatus", "behind", "result"],
            !!spawnStatus.out.match(/(ahead|behind)/)
          ),
          store.set(
            [...props, "gitStatus", "dirty", "result"],
            !spawnStatus.out.match(/nothing to commit/)
          ),
          store.set(
            [
              ...props,
              "gitStatus",
              "needsPublish",
              "result",
            ],
            !spawnLog.out.match(/Version bump/)
          ),
        ])
      },

      store: output,
    })

  return options
}
