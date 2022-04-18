import { mutations } from './mutations.js'

export const moves = (
  node,
  target = node.ownerDocument,
  {
    childList = true,
    subtree = true
  } = {}
) => {
  return mutations(node, target, mapper, { childList, subtree })
}

const set = (
  states,
  value,
  nodes,
  matches,
) => {
  for (const current of nodes) {
    if (matches(current)) {
      states.set(current, value)
    }
  }
}

const mapper = function* (
  records,
  matches,
  next
) {
  const states = new Map()

  for (const { addedNodes, removedNodes } of records) {
    set(states, false, removedNodes, matches)
    set(states, true, addedNodes, matches)
  }

  yield* states.values()
}
