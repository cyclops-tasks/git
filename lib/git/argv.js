export async function resetArgv({ argv, events, store }) {
  await store.set("cyclops.argvOptions.alias", {
    a: ["all"],
    c: ["commit"],
    d: ["dry"],
    m: ["message"],
    p: ["push"],
  })

  await events.argv("cyclops", {
    argv,
    options: store.get("cyclops.argvOptions"),
  })
}
