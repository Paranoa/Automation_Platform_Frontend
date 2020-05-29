export function compileCode(code, rules) {
  if (!(code && rules)) {
    return
  }

  const matchFunc = (funcObj) => {
    const { funcName, args, assign } = funcObj
    const rule = rules[funcName]

    if (!rule) {
      // error: no such function
      return new Error(`不存在的方法名: ${funcName}`)
    }

    // if (rule.args && args.length !== rule.args.length) {
    //   // error: args not match
    //   return new Error(`参数个数不匹配, 方法名: ${funcName}, expected: ${rule.args.length}, got: ${args.length}`)
    // }

    // if (rule.return_args && assign.length !== rule.return_args.length) {
    //   // error: ret_args not match
    //   return new Error(`返回参数个数不匹配 方法名: ${funcName}, expected: ${rule.return_args.length}, got: ${assign.length}`)
    // }

    return {
      keyword: funcName,
      args,
      assign
    }
  }

  const getCompileResult = (statement) => {
    const hasRetValue = statement.indexOf('=    ') > -1
    if (hasRetValue) {
      const stateSplits = statement.split('=    ')
      if (stateSplits.length > 2) {
        // error: syntax error
        return new Error(`语法错误: ${statement}`)
      }
      const [assignStr, funcStr] = stateSplits

      const assign = assignStr.split('    ')
      if (!assign) {
        // error: no return_arg
        return new Error(`缺少返回参数: ${statement}`)
      }
      const funcSplits = funcStr.split('    ')
      if (funcSplits.length < 2) {
        // error: no function arg
        return new Error(`缺少方法参数: ${statement}`)
      }
      const [funcName, ...args] = funcSplits

      const funcObj = {
        funcName,
        args: args.filter(_ => _),
        assign: assign.filter(_ => _)
      }
      return matchFunc(funcObj)
    } else {
      const funcSplits = statement.split('    ')
      const [funcName, ...args] = funcSplits

      const funcObj = {
        funcName,
        args: args.filter(_ => _)
      }
      return matchFunc(funcObj)
    }
  }

  // 移除换行符
  const statements = code.replace(/\n/g, '').split(';')
  const results = []
  for (const statement of statements) {
    if (statement) {
      const compileResult = getCompileResult(statement)
      if (compileResult instanceof Error) {
        return compileResult
      } else {
        results.push(compileResult)
      }
    }
  }
  return results
}
