// 汇总整个配置文件
type AnymatchFn = (testString: string) => boolean;
type AnymatchPattern = string|RegExp|AnymatchFn;
type AnymatchMatcher = AnymatchPattern|AnymatchPattern[]

export interface Config {
  checkFileExtname: AnymatchMatcher;
}

const config: Config = {
  // 需要校验的文件后缀, 支持正则、函数类型
  checkFileExtname: ['js', 'jsx', 'tsx', 'ts'],
}


export default config;
