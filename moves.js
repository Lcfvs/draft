import { mutations } from './mutations.js'

const childList = true

export const moves = (
  node,
  target = node.ownerDocument,
  {
    subtree = true
  } = {}
) => {
  return mutations(node, target, mapper, { childList, subtree })
}

const mapper = function* (
  records,
  matches
) {
  const states = new Map()

  for (const { addedNodes, removedNodes } of records) {
    update(states, false, removedNodes, matches)
    update(states, true, addedNodes, matches)
  }

  yield* states.values()
}

const update = (
  states,
  value,
  nodes,
  matches
) => {
  for (const current of nodes) {
    if (matches(current)) {
      states.set(current, value)
    }
  }
}
