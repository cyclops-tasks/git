export function dryMode({ events, store }) {
  if (!store.get("argv.opts.dry")) {
    return
  }

  events.onAny("before.spawn", async ({ event }) => {
    event.signal.cancel = true
  })
}
