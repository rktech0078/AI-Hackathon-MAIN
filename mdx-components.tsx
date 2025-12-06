import { useMDXComponents as getThemeComponents } from 'nextra-theme-docs'
import { CodeBlockWithCopy } from '@/components/CodeBlockWithCopy'

const themeComponents = getThemeComponents()

export function useMDXComponents(components: any) {
  return {
    ...themeComponents,
    pre: CodeBlockWithCopy,
    ...components
  }
}
