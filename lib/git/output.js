export function output({ event }) {
  if (event.props.indexOf("result") > -1) {
    if (event.options.value) {
      // eslint-disable-next-line no-console
      console.log(
        [event.props[1], event.props[3]].join("\t\t")
      )
    }
  }
}
