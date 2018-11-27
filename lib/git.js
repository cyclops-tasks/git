// Packages
import { argvRelay } from "@dot-event/argv"
import dotLog from "@dot-event/log"
import dotSpawn from "@dot-event/spawn"
import dotStatus from "@dot-event/status"

// Helpers
import { output } from "./git/output"

// Composer
export default function(options) {
  const { events } = options

  if (events.ops.has("git")) {
    return options
  }

  dotLog({ events })
  dotSpawn({ events })
  dotStatus({ events })

  events
    .withOptions({
      cwd: process.cwd(),
    })
    .onAny({
      git: argvRelay,

      gitCommit: async function(options) {
        const { cwd, events, message, props } = options

        if (!message) {
          throw new Error("No message specified")
        }

        const { behind, dirty } = await events.gitStatus(
          props,
          options
        )

        const command = "git"

        if (!behind && dirty) {
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
        }
      },

      gitSetupOnce: () =>
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
        const { cwd, event, events, props } = options
        const command = "git"

        await Promise.all([
          events.spawn([...props, "gitStatus", "log"], {
            args: ["log", "-1", "--pretty=%B"],
            command,
            cwd,
            lax: true,
            quiet: true,
          }),
          events.spawn([...props, "gitStatus", "status"], {
            args: ["status", "-uno"],
            command,
            cwd,
            lax: true,
            quiet: true,
          }),
        ])

        const { log, status } = events.get([
          ...props,
          "gitStatus",
        ])

        const results = {
          behind: !!status.out.match(/(ahead|behind)/),
          dirty: !status.out.match(/nothing to commit/),
          needsPublish: !log.out.match(/Version bump/),
        }

        await events.set(
          [...props, "gitStatus", "results"],
          results
        )

        event.signal.returnValue = results
      },

      set: output,
    })

  return options
}
