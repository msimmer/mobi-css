
import test from 'ava'
import path from 'path'
import fs from 'fs'
import mobi from '../dist/index'

test('It loads an individual file or an array of files', t => {
  t.plan(4)

  const makeArray = arg =>
    arg.constructor !== Array
      ? arg.split(',').map(_ => _.replace(/(?:^\s+|\s+$)/, ''))
      : arg

  const files = makeArray([
    'styles1.css',
    'styles2.css'
  ])

  const file = makeArray('styles1.css')

  t.true(Array.isArray(files))
  t.true(Array.isArray(file))
  t.is(files.length, 2)
  t.is(file.length, 1)
})

test('It parses the files serially', t => {
  t.plan(1)

  const promiseWrap = (input) => {
    const promises = []
    input.forEach(_ => promises.push(_))
    return new Promise((resolve, reject) => {
      return Promise.all(promises)
      .then(results => resolve(results))
    })
  }

  const files = [
    path.join(__dirname, 'styles1.css'),
    path.join(__dirname, 'styles2.css')
  ]

  return promiseWrap(files)
  .then(result => t.is(result.length, 2))
})


test('It removes the appropriate CSS', t => {
  t.plan(5)

  const files = [
    path.join(__dirname, 'styles1.css'),
    path.join(__dirname, 'styles2.css')
  ]

  return mobi.promiseWrap(files)
  .then(result => {
    t.is(result.length, 2)
    t.true(Buffer.isBuffer(result[0]))
    t.true(Buffer.isBuffer(result[1]))
    t.notRegex(String(result[0]), /hyphens/g)
    t.regex(String(result[1]), /^\s*$/)
  })
})
