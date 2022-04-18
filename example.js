import { moves } from './moves.js'

const counters = new WeakMap()

const count = async (
  node
) => {
  // skip, if already active
  if (counters.has(node)) {
    return
  }

  counters.set(node, 0)

  for await (const moved of moves(node)) {
    // continues, if the node is still into the document
    if (moved) {
      counters.set(node, counters.get(node) + 1)
      continue
    }

    // the node is removed
    break
  }

  // cleaning immediately!
  counters.delete(node)
}

const start = async () => {
  const { body } = document
  const node = document.createElement('slot')

  body.append(node)

  setTimeout(() => {
    console.log('append', counters.get(node))
    body.append(node)
  }, 100)

  setTimeout(() => {
    console.log('remove & append', counters.get(node))
    node.remove()
    body.append(node)
  }, 200)

  setTimeout(() => {
    console.log('remove', counters.get(node))
    node.remove()
  }, 300)

  setTimeout(() => {
    console.log('append but already stopped', counters.get(node))
    body.append(node)
  }, 400)
  
  return store(node)
}

queueMicrotask(start)
