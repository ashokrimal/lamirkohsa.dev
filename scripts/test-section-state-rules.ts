import test from 'node:test'
import assert from 'node:assert/strict'

import {
  ABOUT_SECTIONS,
  CMS_SCHEMA,
  NAV_PAGES,
  NAV_ROUTES,
  SECTIONS,
  sectionNumber,
  stripSectionNumber,
  withSectionNumber,
} from '../src/lib/cms-schema.ts'
import { isRepositoryUrl } from '../src/lib/urls.ts'

test('homepage SECTIONS are the fixed, ordered registry', () => {
  assert.deepEqual(
    SECTIONS.map((section) => section.id),
    ['about', 'gallery', 'experience', 'education', 'projects', 'media', 'github'],
  )
  assert.deepEqual(
    SECTIONS.map((section) => section.route),
    ['/about', '/about/gallery', '/experience', '/education', '/projects', '/media', '/about/github'],
  )
  assert.deepEqual(
    SECTIONS.map((section) => section.component),
    [
      'HomeIntroduction',
      'HomeGallery',
      'HomeExperience',
      'HomeEducation',
      'HomeProjects',
      'HomeMedia',
      'HomeGitHub',
    ],
  )
  assert.deepEqual(
    SECTIONS.map((section) => section.collection),
    ['Profile', 'Gallery', 'Experience', 'Education', 'Projects', 'Media Collections', 'Profile'],
  )
  assert.equal(SECTIONS.length, 7)
})

test('homepage section numbers are consecutive from 01 and never gap', () => {
  assert.deepEqual(
    SECTIONS.map((_, index) => sectionNumber(index)),
    ['01', '02', '03', '04', '05', '06', '07'],
  )
  assert.equal(sectionNumber(-1), '01')
})

test('section numbering strips hand-typed CMS prefixes', () => {
  assert.equal(stripSectionNumber('01 / About Me'), 'About Me')
  assert.equal(stripSectionNumber('5 · Career & Toolkit'), 'Career & Toolkit')
  assert.equal(stripSectionNumber('02 | Gallery'), 'Gallery')
  assert.equal(stripSectionNumber('  03 - Experience  '), 'Experience')
  assert.equal(stripSectionNumber('Plain label'), 'Plain label')
  assert.equal(stripSectionNumber('01 /'), undefined)
  assert.equal(stripSectionNumber(''), undefined)
  assert.equal(stripSectionNumber(undefined), undefined)

  assert.equal(withSectionNumber(0, '01 / About Me'), '01 / About Me')
  assert.equal(withSectionNumber(2, '05 / Career & Toolkit'), '03 / Career & Toolkit')
  assert.equal(withSectionNumber(4, 'Selected Work'), '05 / Selected Work')
  assert.equal(withSectionNumber(6, undefined), '07')
})

test('about page sections are fixed and numbered in order', () => {
  assert.deepEqual(
    ABOUT_SECTIONS.map((section) => section.id),
    ['education', 'experience', 'skills', 'interests', 'socials', 'github'],
  )
  assert.deepEqual(
    ABOUT_SECTIONS.map((section, index) => withSectionNumber(index, section.label)),
    [
      '01 / Education',
      '02 / Experience',
      '03 / Skills',
      '04 / Interests',
      '05 / Social Links',
      '06 / GitHub',
    ],
  )
  assert.equal(ABOUT_SECTIONS.length, 6)
})

test('navigation pages own all site routes and labels', () => {
  const routes = NAV_PAGES.map((page) => page.route)
  assert.equal(new Set(routes).size, routes.length, 'navigation routes must be unique')
  assert.deepEqual([...NAV_ROUTES].sort(), [...routes].sort())

  for (const route of ['/', '/about', '/projects', '/blogs', '/contact', '/media', '/experience', '/education', '/skills', '/certificates', '/resume', '/about/gallery', '/about/github', '/media/music', '/media/movies', '/media/anime', '/media/manga']) {
    assert.equal(NAV_ROUTES.has(route), true, `expected NAV_ROUTES to include ${route}`)
  }
  assert.equal(NAV_ROUTES.has('/gallery'), false, '/gallery is not a site route; gallery lives at /about/gallery')

  const byId = new Map(NAV_PAGES.map((page) => [page.id, page]))
  assert.equal(byId.get('home')?.defaultVisible, true)
  assert.equal(byId.get('contact')?.defaultVisible, true)
  assert.equal(byId.get('github')?.defaultVisible, false)
  assert.equal(byId.get('movies')?.defaultVisible, false)
  assert.deepEqual(byId.get('resume')?.groups, ['collections'])
})

test('each structural section declares a specific empty state', () => {
  for (const section of SECTIONS) {
    assert.ok(section.emptyState.message.length > 0, `${section.id} must have an empty message`)
    assert.notEqual(section.emptyState.message.toLowerCase(), 'empty')
  }

  assert.equal(CMS_SCHEMA.sections.home.projects.emptyState.message, 'No projects published yet')
  assert.equal(CMS_SCHEMA.sections.home.gallery.emptyState.message, 'No gallery images published yet.')
  assert.equal(CMS_SCHEMA.sections.home.about.emptyState.message, 'No introduction published yet.')
  assert.equal(CMS_SCHEMA.sections.home.experience.emptyState.message, 'No experience published yet')
  assert.equal(CMS_SCHEMA.sections.home.education.emptyState.message, 'No education published yet')
  assert.equal(CMS_SCHEMA.sections.home.media.emptyState.message, 'No media items published yet.')
  assert.equal(CMS_SCHEMA.sections.home.github.emptyState.message, 'GitHub status is not connected yet.')
  assert.equal(CMS_SCHEMA.sections.pages.blogs.emptyState.message, 'No journal entries published yet.')
  assert.equal(CMS_SCHEMA.sections.home.blogArticle.emptyState.message, 'This note has no body yet.')
  assert.equal(CMS_SCHEMA.sections.pages.contact.emptyState.message, 'Contact details are not published yet.')
})

test('project source links only accept repository URLs', () => {
  assert.equal(isRepositoryUrl('https://github.com/ashokrimal/lamirkohsa.dev'), true)
  assert.equal(isRepositoryUrl('https://gitlab.com/group/project'), true)
  assert.equal(isRepositoryUrl('https://bitbucket.org/team/repo'), true)
  assert.equal(isRepositoryUrl('https://codeberg.org/user/repo'), true)

  assert.equal(isRepositoryUrl('https://github.com/ashokrimal'), false)
  assert.equal(isRepositoryUrl('https://github.com'), false)
  assert.equal(isRepositoryUrl('https://example.com/owner/repo'), false)
  assert.equal(isRepositoryUrl('mailto:test@example.com'), false)
  assert.equal(isRepositoryUrl('not-a-url'), false)
  assert.equal(isRepositoryUrl(''), false)
  assert.equal(isRepositoryUrl(undefined), false)
})

test('homepage registry is independent of CMS order and visibility', () => {
  // The registry is code-owned: its order and presence are not read from CMS.
  for (const section of SECTIONS) {
    assert.equal('order' in section, false)
    assert.equal('enabled' in section, false)
  }
  // The fixed order is exactly as declared (experience precedes projects).
  const ids = SECTIONS.map((section) => section.id)
  assert.equal(ids.indexOf('experience') < ids.indexOf('projects'), true)
})

console.log('section and state rules: ok')
