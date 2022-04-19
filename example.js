import { moves } from './moves.js'
import { log } from './mutations.js'

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
    const counter = counters.get(node) + 1
    
    console.log({ counter })
    
    // continues, if the node is still into the document
    if (moved) {
      counters.set(node, counter)
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
    console.log('append')
    body.append(node)
  }, 100)

  setTimeout(() => {
    console.log('remove & append')
    node.remove()
    body.append(node)
  }, 200)

  setTimeout(() => {
    console.log('remove')
    node.remove()
  }, 300)

  setTimeout(() => {
    console.log('append but already stopped')
    body.append(node)
  }, 400)
  
  await count(node)
  console.log({ counters })
  log()
}

queueMicrotask(start)
