// 汇总整个配置文件
type AnyMatchFn = (testString: string) => boolean;
type AnyMatchPattern = string|RegExp|AnyMatchFn;
type AnyMatchMatcher = AnyMatchPattern|AnyMatchPattern[]

export interface Config {
  checkFileExtname: AnyMatchMatcher;
}

const config: Config = {
  // 需要校验的文件后缀, 支持正则、函数类型
  checkFileExtname: ['js', 'jsx', 'tsx', 'ts'],
}

export default config;
