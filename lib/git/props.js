export function propsFn({ event, taskId }) {
  return (...keys) => [
    ...(taskId ? ["tasks", taskId] : []),
    ...(event.props || []),
    ...keys,
  ]
}
