import { PortableText, type PortableTextComponents } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/types'
import SmartLink from './SmartLink'

const components: PortableTextComponents = {
  list: { bullet: ({ children }) => <ul className="plain-list">{children}</ul> },
  marks: {
    link: ({ value, children }) => <SmartLink url={value?.href ?? '#'}>{children}</SmartLink>,
  },
}

export default function RichText({ value }: { value: PortableTextBlock[] }) {
  return <PortableText value={value} components={components} />
}
