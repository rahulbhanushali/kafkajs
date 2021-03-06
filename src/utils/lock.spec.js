const waitFor = require('./waitFor')
const flatten = require('./flatten')
const Lock = require('./lock')

const sleep = value => waitFor(delay => delay >= value)

describe('Utils > Lock', () => {
  it('allows only one resource at a time', async () => {
    const lock = new Lock()
    const resource = jest.fn()
    const callResource = async () => {
      try {
        await lock.acquire()
        resource(Date.now())
        await sleep(50)
      } finally {
        await lock.release()
      }
    }

    await Promise.all([callResource(), callResource(), callResource()])
    const calls = flatten(resource.mock.calls)
    expect(calls.length).toEqual(3)
    expect(calls[1] - calls[0]).toBeGreaterThanOrEqual(50)
    expect(calls[2] - calls[1]).toBeGreaterThanOrEqual(50)
  })

  it('throws an error if the lock cannot be acquired within a period', async () => {
    const lock = new Lock({ timeout: 60 })
    const resource = jest.fn()
    const callResource = async () => {
      await lock.acquire()
      resource(Date.now())
      await sleep(50)
      // it never releases the lock
    }

    await expect(
      Promise.all([callResource(), callResource(), callResource()])
    ).rejects.toHaveProperty('message', 'Timeout while acquiring lock (2 waiting locks)')
  })

  describe('with a description', () => {
    it('throws an error with the configured description if the lock cannot be acquired within a period', async () => {
      const lock = new Lock({ timeout: 60, description: 'My test mock' })
      const resource = jest.fn()
      const callResource = async () => {
        await lock.acquire()
        resource(Date.now())
        await sleep(50)
        // it never releases the lock
      }

      await expect(
        Promise.all([callResource(), callResource(), callResource()])
      ).rejects.toHaveProperty(
        'message',
        'Timeout while acquiring lock (2 waiting locks): "My test mock"'
      )
    })
  })
})
