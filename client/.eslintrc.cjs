module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['vue'],
  rules: {
    // 代码风格
    'semi': ['error', 'always'],  // 强制使用分号
    'quotes': ['error', 'single'],  // 强制使用单引号
    'indent': ['error', 2],  // 强制使用2空格缩进
    'no-trailing-spaces': 'error',  // 禁止行尾空格
    'eol-last': ['error', 'always'],  // 文件末尾需要换行
    'comma-dangle': ['error', 'always-multiline'],  // 多行时允许尾逗号

    // 变量
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],  // 未使用的变量警告（忽略_开头的参数）
    'no-console': ['warn', { allow: ['error', 'warn'] }],  // 限制console使用

    // 最佳实践
    'eqeqeq': ['error', 'always'],  // 强制使用全等
    'no-var': 'error',  // 禁止使用var
    'prefer-const': 'error',  // 优先使用const
    'no-throw-literal': 'error',  // 禁止抛出字面量错误

    // ES6
    'arrow-spacing': 'error',  // 箭头函数空格
    'no-duplicate-imports': 'error',  // 禁止重复导入
    'prefer-template': 'warn',  // 优先使用模板字符串

    // Vue
    'vue/multi-word-component-names': 'off',  // 关闭组件名多词要求
    'vue/require-default-prop': 'off',  // 关闭默认prop要求
    'vue/max-attributes-per-line': ['error', {
      singleline: 3,
      multiline: 1,
    }],  // 单行最多3个属性，多行每行1个
    'vue/singleline-html-element-content-newline': 'off',  // 关闭单行元素内容换行
    'vue/attribute-hyphenation': ['error', 'always'],  // 属性使用连字符
    'vue/v-on-event-hyphenation': ['error', 'always'],  // 事件使用连字符
  },
  globals: {
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly',
  },
};
