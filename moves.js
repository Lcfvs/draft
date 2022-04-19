import { mutations } from './mutations.js'

const childList = true

export const moves = (
  node,
  target = node.ownerDocument,
  subtree = true
) => {
  return mutations(node, target, mapper, { childList, subtree })
}

const mapper = function* (
  records
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
  nodes
) => {
  for (const current of nodes) {
    states.set(current, value)
  }
}
