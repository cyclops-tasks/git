export async function output({ event, events, props }) {
  if (
    props.indexOf("gitStatus") > -1 &&
    props.indexOf("results") > -1
  ) {
    const value = event.args[0]
    const fails = Object.keys(value).filter(
      key => !!value[key]
    )

    await events.status(props, {
      fail: fails.length,
      highlight: true,
      msg: fails,
      op: "gitStatus",
    })
  }
}
