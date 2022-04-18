import { iterator } from './iterator.js'

export const tree = (
  node,
  target = node.ownerDocument,
  {
    childList = true,
    subtree = true
  } = {}
) => {
  return iterator(node, target, mapper, { childList, subtree })
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

const mapper = (
  records,
  matches,
  next
) => {
  const states = new Map()

  for (const { addedNodes, removedNodes } of records) {
    set(states, false, removedNodes, matches)
    set(states, true, addedNodes, matches)
  }

  for (const [, state] of states) {
    next(state)
  }
}
