import { createHmac } from 'node:crypto'

export const SECRET = `whsec_${Buffer.from('local-test-key').toString('base64')}`

/** Sign a payload the way Svix does, for exercising the webhook locally. */
export function sign(
  payload: string,
  options: { id?: string; timestamp?: number; secret?: string } = {},
) {
  const id = options.id ?? 'msg_1'
  const timestamp = options.timestamp ?? Math.floor(Date.now() / 1000)
  const key = Buffer.from((options.secret ?? SECRET).replace(/^whsec_/, ''), 'base64')
  const signature = createHmac('sha256', key).update(`${id}.${timestamp}.${payload}`).digest('base64')
  return { id, timestamp: String(timestamp), signature: `v1,${signature}` }
}
