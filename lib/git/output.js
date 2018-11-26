export function output({ event }) {
  if (event.props.indexOf("result") > -1) {
    if (event.args[0]) {
      // eslint-disable-next-line no-console
      console.log(
        [event.props[1], event.props[3]].join("\t\t")
      )
    }
  }
}
