import { moves } from './moves.js'
import { log } from './mutations.js'

const counters = new WeakMap()

const wait = async delay =>
  new Promise(resolve => setTimeout(resolve, delay))

const tasks = Object.entries({
  'append': (node, body) => {
    body.append(node)
  },
  'remove & append': (node, body) => {
    node.remove()
    body.append(node)
  },
  'remove': (node) => {
    node.remove()
  },
  'append but already stopped': (node, body) => {
    body.append(node)
  }
})

const count = async node => {
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
  
  for (const [message, task] of tasks) {
    console.log(message)
    task(node, body)
    await wait(100)
  }
  
  await count(node)
  console.log({ counters })
  log()
}

queueMicrotask(start)
