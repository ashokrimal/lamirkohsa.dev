import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { findMissingMailEnv } from '../src/lib/mailer'

describe('findMissingMailEnv', () => {
  it('reports every mail variable when none are set', () => {
    assert.deepEqual(findMissingMailEnv({}), [
      'RESEND_API_KEY',
      'RESEND_EMAIL_DOMAIN',
      'CONTACT_TO_EMAIL',
    ])
  })

  it('reports only the gaps that remain', () => {
    assert.deepEqual(
      findMissingMailEnv({
        RESEND_API_KEY: 're_test',
        RESEND_EMAIL_DOMAIN: 'example.test',
      }),
      ['CONTACT_TO_EMAIL'],
    )
  })

  it('treats ADMIN_EMAIL as the contact inbox', () => {
    assert.deepEqual(
      findMissingMailEnv({
        RESEND_API_KEY: 're_test',
        RESEND_EMAIL_DOMAIN: 'example.test',
        ADMIN_EMAIL: 'owner@example.test',
      }),
      [],
    )
  })

  it('ignores whitespace-only values', () => {
    assert.deepEqual(
      findMissingMailEnv({
        RESEND_API_KEY: '   ',
        RESEND_EMAIL_DOMAIN: ' example.test ',
        CONTACT_TO_EMAIL: 'owner@example.test',
      }),
      ['RESEND_API_KEY'],
    )
  })
})
