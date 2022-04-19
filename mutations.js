const contexts = new WeakMap()
const generators = new WeakMap()
const mappers = new WeakMap()
const matchers = new WeakMap()
const observers = new WeakMap()
const resolvers = new WeakMap()
const targets = new WeakMap()
let picked

export const mutations = (
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

export const log = () => {
  console.log({
    generators,
    mappers,
    matchers,
    observers,
    resolvers,
    targets
  })
}

const generate = async function* (
  context
) {
  const generator = contexts.get(context)
  const { mapper, node, options, target } = context
  const { ownerDocument } = target
  const document = ownerDocument ?? target
  const matches = current => current === node
  const observer = observe(document, target, options)
  const observed = generators.get(observer)
  const promises = []
  const resolver = [promises]

  contexts.delete(context)
  mappers.set(generator, mapper)
  matchers.set(generator, matches)
  resolvers.set(generator, resolver)
  targets.set(generator, target)
  observed.add(generator)
  observer.observe(target, options)
  resolve(resolver)

  try {
    while (true) {
      yield promises.shift()
    }
  } finally {
    mappers.delete(generator)
    matchers.delete(generator)
    resolvers.delete(generator)
    targets.delete(generator)
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
    const resolver = resolvers.get(generator)
    const target = targets.get(generator)
    const filtered = []

    for (const record of records) {
      if (target.contains(record.target)) {
        filtered.push(record)
      }
    }

    for (const state of mapper(filtered, matches)) {
      resolve(resolver, state)
    }
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
