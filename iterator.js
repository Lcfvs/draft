const contexts = new WeakMap()
const generators = new WeakMap()
const mappers = new WeakMap()
const observers = new WeakMap()
const resolvers = new WeakMap()
const matchers = new WeakMap()
const targets = new WeakMap()
let picked

export const iterator = (
  node,
  target,
  mapper,
  options
) => {
  const context = { mapper, node, options, target }
  const generator = generate(context)

  contexts.set(context, generator)

  return generator
}

const generate = async function* (
  context
) {
  const generator = contexts.get(context)
  const { mapper, node, options, target } = context
  const { ownerDocument } = target
  const document = ownerDocument ?? target
  const observer = observe(document, target, options)
  const observed = generators.get(observer)
  const promises = []
  const next = value => resolve([promises], value)
  const matches = current => current === node

  contexts.delete(context)
  observed.add(generator)
  mappers.set(generator, mapper)
  resolvers.set(generator, next)
  matchers.set(generator, matches)
  targets.set(generator, target)
  observer.observe(target, options)
  next()

  try {
    while (true) {
      yield promises.shift()
    }
  } finally {
    mappers.delete(generator)
    resolvers.delete(generator)
    matchers.delete(generator)
    targets.delete(target)
    observed.delete(generator)

    if (!observed.size) {
      observer.disconnect()
      generators.delete(observer)
      observers.delete(document)
    }
  }
}

const observe = (
  document,
  target,
  options
) => {
  if (!observers.has(document)) {
    const { defaultView } = document
    const { MutationObserver } = defaultView
    const observer = new MutationObserver(callback)

    generators.set(observer, new Set())
    observers.set(document, observer)
  }

  const observer = observers.get(document)

  observer.observe(target, options)

  return observer
}

const callback = (
  records,
  observer
) => {
  for (const generator of generators.get(observer)) {
    const mapper = mappers.get(generator)
    const matches = matchers.get(generator)
    const next = resolvers.get(generator)
    const target = targets.get(generator)
    const filtered = []

    for (const record of records) {
      if (target.contains(record.target)) {
        filtered.push(record)
      }
    }

    mapper(filtered, matches, next)
  }
}

const resolve = (
  resolver,
  state = null
) => {
  const [promises, resolve] = resolver

  promises.push(new Promise(pick))
  resolver[1] = picked
  resolve?.(state)
}

const pick = resolve =>
  picked = resolve
