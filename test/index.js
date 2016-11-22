
import test from 'ava'
import path from 'path'
import fs from 'fs'
import mobi from '../dist/index'

test('It loads an array of files', t => {
  t.plan(1)
  const files = [
    path.join(__dirname, 'styles1.css'),
    path.join(__dirname, 'styles2.css')
  ]
  t.is(files.length, 2)
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
