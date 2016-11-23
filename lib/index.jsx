
import fs from 'fs'
import css from 'css'

const BLACKLISTED_PREFIXES = ['epub|']
const BLACKLISTED_TYPES = ['namespace']
const BLACKLISTED_PROPERTIES = [
  'line-height',
  '-webkit-hyphens',
  '-epub-hyphens',
  'adobe-hyphenate',
  '-moz-hyphens',
  '-ms-hyphens',
  'hyphens',
  'word-break',
  'widows',
  'orphans',
  'text-rendering',
  '-webkit-font-smoothing',
  '-moz-osx-font-smoothing',
  '-webkit-text-fill-color'
]

class Mobi {
  static arrayFrom(arg) {
    return arg.constructor !== Array
      ? arg.split(',').map(_ => _.replace(/(?:^\s+|\s+$)/, ''))
      : arg
  }

  constructor() {
    this.options = {
      input: null,
      output: 'buffer'
    }
  }

  _set(key, val) {
    this.options[key] = val
    return this.options[key]
  }

  _get(key) {
    return this.options[key]
  }

  read(file) {
    return new Promise((resolve, reject) =>
      fs.readFile(file, 'utf8', (err, data) => {
        if (err) { reject(err) }

        const ast = css.parse(data)
        let i = ast.stylesheet.rules.length - 1

        while (i >= 0) {
          const rule = ast.stylesheet.rules[i]
          if (rule.selectors) {
            let j = rule.selectors.length - 1
            while (j >= 0) {
              let jj = 0
              while (jj < BLACKLISTED_PREFIXES.length) {
                const selector = rule.selectors[j].slice(0, BLACKLISTED_PREFIXES[jj].length)
                if (selector === BLACKLISTED_PREFIXES[jj]) {
                  console.log(`Removing selector ${rule.selectors[j]}`) // eslint-disable-line no-console
                  rule.selectors.splice(j, 1)
                }
                jj += 1
              }
              j -= 1
            }
          }

          if (BLACKLISTED_TYPES.indexOf(rule.type) > -1) {
            console.log(`Removing ${rule.type} ${rule[rule.type]}`) // eslint-disable-line no-console
            ast.stylesheet.rules.splice(i, 1)
          }

          if (ast.stylesheet.rules[i]) {
            const { declarations } = ast.stylesheet.rules[i]
            if (declarations) {
              let a = declarations.length - 1
              while (a >= 0) {
                if (BLACKLISTED_PROPERTIES.indexOf(declarations[a].property) > -1) {
                  console.log(`Removing property ${declarations[a].property}`) // eslint-disable-line no-console
                  declarations.splice(a, 1)
                }
                a -= 1
              }
            }
          }
          i -= 1
        }
        resolve(
          this._get('output') !== 'string'
            ? new Buffer(css.stringify(ast))
            : css.stringify(ast)
        )
      })
    )
  }

  parse(file) {
    return new Promise((resolve/* , reject */) => {
      this.read(file).then(content => resolve(content))
    })
  }

  promiseWrap(input) {
    const promises = []
    input.forEach(_ => promises.push(this.parse(_)))
    return new Promise(resolve/* , reject */ =>
      Promise.all(promises).then(results => resolve(results))
    )
  }

  makeArray(arg) {
    return this.constructor.arrayFrom(arg)
  }

  strip({ ...args }) {
    Object.assign(this.options, args)
    const required = ['input']
    required.forEach((_) => {
      if (!this.options[_] || !{}.hasOwnProperty.call(this.options, _)) {
        throw new Error(`Missing required argument: \`${_}\``)
      }
    })
    const input = this.makeArray(this._get('input'))
    this._set('input', input)
    return new Promise(resolve /* , reject */ =>
      this.promiseWrap(this._get('input'))
      .catch(err => console.error(err)) // eslint-disable-line no-console
      .then(resolve)
    )
  }
}

const mobi = new Mobi()
export default mobi
