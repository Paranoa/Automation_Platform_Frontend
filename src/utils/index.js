/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
      time = parseInt(time)
    }
    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value ] }
    return value.toString().padStart(2, '0')
  })
  return time_str
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time, option) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = url.split('?')[1]
  if (!search) {
    return {}
  }
  return JSON.parse(
    '{"' +
      decodeURIComponent(search)
        .replace(/"/g, '\\"')
        .replace(/&/g, '","')
        .replace(/=/g, '":"')
        .replace(/\+/g, ' ') +
      '"}'
  )
}

export function compileCode(code, rules) {
  console.log('code: ', code)
  const matchSnippet = (match, type) => {
    const funcName = match[1]
    const paramStr = match[2]
    const params = paramStr.split(',')
    const rule = rules[funcName]
    console.log('snippetMatchResult:', 'funcName', funcName, 'paramStr', paramStr, 'params', params, 'rule', rule)
    // 关键字名不存在
    if (!rule) {
      return false
    }
    // 参数个数匹配则视为通过
    if (params.length === rule.count && type === rule.keytype) {
      return {
        id: rule.id,
        params: params
      }
    }
    return false
  }

  const getCompileId = (snippet) => {
    // 匹配 $name[...params]
    const match_type_1 = snippet.match(/^([^()[\]]*)\[(.*)\]$/)
    // 匹配 $name(...params)
    const match_type_2 = snippet.match(/^([^()[\]]*)\((.*)\)$/)
    
    if (match_type_1 && match_type_1.length >= 3) {
      return matchSnippet(match_type_1, 1)
    } else if (match_type_2 && match_type_2.length >= 3) {
      return matchSnippet(match_type_2, 2)
    } else {
      // 不匹配$name[...params]与$name(...params), 则从关键字中匹配
      const keyword = rules._keywords.find(({ value }) => snippet === value)
      if (keyword) {
        return {
          id: keyword.id
        }
      } else {
        return false
      }
    }
  }
  
  // 移除换行符
  const statements = code.replace(/\n/g, '').split(';')
  const results = []
  for (const statement of statements) {
    const snippets = statement.split(' ')
    console.log('snippets: ', snippets)
    for (const snippet of snippets) {
      if (snippet) {
        const result = getCompileId(snippet)
        if (result) {
          console.log(`compile success:}`, result)
          results.push(result)
        } else {
          console.log('compile failed')
          return false
        }
      }
    }
  }
  console.log(results)
  return results
}
