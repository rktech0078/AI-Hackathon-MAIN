import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { useMDXComponents as getMDXComponents } from '../../mdx-components'

const nextraGenerateStaticParams = generateStaticParamsFor('mdxPath')

export async function generateStaticParams() {
    console.log('Generating static params...')
    try {
        const params = await nextraGenerateStaticParams()
        console.log('Generated params:', params)
        return params
    } catch (e) {
        console.error('Error generating static params:', e)
        throw e
    }
}

const Wrapper = getMDXComponents({}).wrapper

export default async function Page(props: { params: Promise<{ mdxPath?: string[] }> }) {
    const params = await props.params
    console.log('Page Params:', params)
    try {
        const result = await importPage(params.mdxPath || [])
        const { default: MDXContent, toc, metadata } = result
        return (
            <Wrapper toc={toc} metadata={metadata}>
                <MDXContent {...props} params={params} />
            </Wrapper>
        )
    } catch (e) {
        console.error('importPage Error in Page:', e)
        return <div>Error loading page: {e instanceof Error ? e.message : String(e)}</div>
    }
}

export async function generateMetadata(props: { params: Promise<{ mdxPath?: string[] }> }) {
    const params = await props.params
    console.log('Metadata Params:', params)
    try {
        const { metadata } = await importPage(params.mdxPath || [])
        return metadata
    } catch (e) {
        console.error('importPage Error in generateMetadata:', e)
        return { title: 'Error' }
    }
}
