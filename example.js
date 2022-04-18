import { moves } from './moves.js'

const contexts = new WeakMap()

const store = async (
  node,
  context
) => {
  // skip, if already active
  if (contexts.has(node)) {
    return
  }

  contexts.set(node, context)

  for await (const moved of moves(node)) {
    // continues, if the node is still into the document
    if (moved) {
      continue
    }

    // the node is removed
    break
  }

  // cleaning immediately!
  contexts.delete(node)
}

const start = async () => {
  const slot = document.createElement('slot')

  document.body.append(slot)

  setTimeout(() => {
    console.log('append', contexts.get(slot))
    document.body.append(slot)
  }, 100)

  setTimeout(() => {
    console.log('remove & append', contexts.get(slot))
    slot.remove()
    document.body.append(slot)
  }, 200)

  setTimeout(() => {
    console.log('remove', contexts.get(slot))
    slot.remove()
  }, 300)

  setTimeout(() => {
    console.log('append but already stopped', contexts.get(slot))
    document.body.append(slot)
  }, 400)
  
  await store(slot, {
    value: 123
  })
}

queueMicrotask(start)
