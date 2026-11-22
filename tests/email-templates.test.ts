import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  blogPostAnnouncement,
  contactAcknowledgement,
  escapeHtml,
  newsletterWelcome,
  replySubject,
} from '../src/lib/email-templates'
import { planBlogAnnouncements } from '../src/lib/blog-notifications'

describe('replySubject', () => {
  it('adds one Re: prefix', () => {
    assert.equal(replySubject('Project question'), 'Re: Project question')
  })

  it('never stacks a second Re:', () => {
    assert.equal(replySubject('Re: Project question'), 'Re: Project question')
    assert.equal(replySubject('RE:   already'), 'RE:   already')
  })

  it('falls back when the subject is blank', () => {
    assert.equal(replySubject('   '), 'Re: your message')
  })
})

describe('contactAcknowledgement', () => {
  const base = {
    name: 'Ada Lovelace',
    subject: 'Build a small CMS',
    message: 'Could you quote a project like this?',
    siteUrl: 'https://example.test',
  }

  it('greets by first name and thanks the sender for their subject', () => {
    const email = contactAcknowledgement(base)
    assert.match(email.subject, /Build a small CMS/)
    assert.match(email.text, /^Hi Ada,/)
    assert.match(email.text, /Thanks for getting in touch about "Build a small CMS"/)
    assert.match(email.text, /> Could you quote a project like this\?/)
  })

  it('mentions project or task details when that is what they asked', () => {
    const email = contactAcknowledgement(base)
    assert.match(email.text, /project, a specific task or a collaboration/)
  })

  it('escapes markup from the submission in the HTML body', () => {
    const email = contactAcknowledgement({
      ...base,
      subject: '<img src=x onerror=alert(1)>',
      message: '<script>alert(1)</script>',
    })
    assert.ok(!email.html.includes('<script>'))
    assert.ok(email.html.includes('&lt;script&gt;'))
    assert.ok(!email.html.includes('<img src=x'))
  })

  it('truncates an over-long message in the quote', () => {
    const email = contactAcknowledgement({ ...base, message: 'x'.repeat(4000) })
    assert.ok(email.text.length < 2000)
    assert.ok(email.text.includes('…'))
  })

  it('handles a missing name', () => {
    const email = contactAcknowledgement({ ...base, name: '   ' })
    assert.match(email.text, /^Hi there,/)
  })
})

describe('newsletterWelcome', () => {
  it('links the journal and a per-subscriber unsubscribe URL', () => {
    const email = newsletterWelcome({
      siteUrl: 'https://example.test',
      unsubscribeUrl: 'https://example.test/api/newsletter/unsubscribe?token=abc',
    })
    assert.match(email.subject, /subscribed/)
    assert.ok(email.text.includes('https://example.test/blogs'))
    assert.ok(email.text.includes('token=abc'))
    assert.ok(email.html.includes('token=abc'))
  })
})

describe('blogPostAnnouncement', () => {
  const base = {
    title: 'Shipping a CMS',
    url: 'https://example.test/blogs/shipping-a-cms',
    excerpt: 'What it took to move content out of code.',
    siteUrl: 'https://example.test',
    unsubscribeUrl: 'https://example.test/api/newsletter/unsubscribe?token=abc',
  }

  it('uses the post title in the subject and body', () => {
    const email = blogPostAnnouncement(base)
    assert.match(email.subject, /^Shipping a CMS/)
    assert.ok(email.text.includes('Shipping a CMS'))
    assert.ok(email.html.includes('Shipping a CMS'))
  })

  it('resolves relative URLs against the site origin', () => {
    const email = blogPostAnnouncement({ ...base, url: '/blogs/shipping-a-cms' })
    assert.ok(email.text.includes('https://example.test/blogs/shipping-a-cms'))
    assert.ok(email.html.includes('https://example.test/blogs/shipping-a-cms'))
  })

  it('escapes the excerpt', () => {
    const email = blogPostAnnouncement({ ...base, excerpt: '<b>bold</b>' })
    assert.ok(!email.html.includes('<b>bold</b>'))
    assert.ok(email.html.includes('&lt;b&gt;bold&lt;/b&gt;'))
  })

  it('always includes the unsubscribe link', () => {
    const email = blogPostAnnouncement(base)
    assert.ok(email.text.includes('Unsubscribe:'))
    assert.ok(email.html.includes('token=abc'))
  })
})

describe('escapeHtml', () => {
  it('escapes the five HTML characters', () => {
    assert.equal(escapeHtml(`<&>"'`), '&lt;&amp;&gt;&quot;\'')
  })
})

describe('planBlogAnnouncements', () => {
  it('builds one message per subscriber with their own token', () => {
    const messages = planBlogAnnouncements({
      post: { title: 'Hello', slug: 'hello', excerpt: 'A post' },
      subscribers: [
        { email: 'a@example.test', token: 'token-a' },
        { email: 'b@example.test', token: 'token-b' },
      ],
      siteUrl: 'https://example.test',
      from: 'Journal <journal@example.test>',
    })

    assert.equal(messages.length, 2)
    assert.equal(messages[0].to, 'a@example.test')
    assert.equal(messages[1].to, 'b@example.test')
    assert.equal(messages[0].from, 'Journal <journal@example.test>')
    assert.ok(messages[0].html.includes('token-a'))
    assert.ok(messages[1].html.includes('token-b'))
    assert.ok(messages[0].text.includes('https://example.test/blogs/hello'))
  })

  it('returns nothing when there are no subscribers', () => {
    assert.deepEqual(
      planBlogAnnouncements({
        post: { title: 'Hello', slug: 'hello' },
        subscribers: [],
        siteUrl: 'https://example.test',
        from: 'journal@example.test',
      }),
      [],
    )
  })
})
