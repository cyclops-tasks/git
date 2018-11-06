export function dryMode({ events, store, taskId }) {
  const { taskLeader } = store.get(`tasks.${taskId}`)

  if (!taskLeader || !store.get("argv.dry")) {
    return
  }

  events.onAny("before.spawn", async ({ event }) => {
    event.signal.cancel = true
  })
}
