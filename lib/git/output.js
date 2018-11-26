import chalk from "chalk"

export function output({ event, props }) {
  if (
    props.indexOf("gitStatus") > -1 &&
    props.indexOf("results") > -1
  ) {
    const value = event.args[0]
    const fails = Object.keys(value).filter(
      key => !!value[key]
    )

    // eslint-disable-next-line no-console
    console.log(
      fails.length ? "🚨" : "✅",
      chalk.gray("gitStatus"),
      props[1],
      fails.length
        ? chalk.white.bgRed(fails.join(", "))
        : ""
    )
  }
}
