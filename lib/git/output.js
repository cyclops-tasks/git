export function output(event) {
  if (
    event.op === "store" &&
    event.props[0] === "cyclops" &&
    event.props.indexOf("git") > -1
  ) {
    if (event.options.value) {
      return [event.props[2], event.props[4]].join("\t\t")
    }
  }
}
