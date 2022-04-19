const mappers = new WeakMap()
const matchers = new WeakMap()
const observers = new WeakMap()
const resolvers = new WeakMap()
let picked

export const mutations = async function* (
  node,
  target,
  mapper,
  options
) {
  const { ownerDocument } = target
  const document = ownerDocument ?? target
  const { defaultView } = document
  const { MutationObserver } = defaultView
  const matches = current => current === node
  const observer = new MutationObserver(callback)
  const promises = []
  const resolver = [promises]

  mappers.set(observer, mapper)
  matchers.set(observer, matches)
  resolvers.set(observer, resolver)
  resolve(resolver)
  observer.observe(target, options)

  try {
    while (true) {
      yield promises.shift()
    }
  } finally {
    observer.disconnect()
    mappers.delete(observer)
    matchers.delete(observer)
    resolvers.delete(observer)
  }
}

export const log = () => {
  console.log({ mappers, matchers, observers, resolvers })
}

const callback = (
  records,
  observer
) => {
  const mapper = mappers.get(observer)
  const matches = matchers.get(observer)
  const resolver = resolvers.get(observer)

  for (const state of mapper([...records], matches)) {
    resolve(resolver, state)
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
