import { twMerge, type ClassNameValue } from 'tailwind-merge'

export const cn = (...inputs: ClassNameValue[]) => twMerge(...inputs)

export const downloadFile = (filename: string, contents: Blob) => {
  const url = URL.createObjectURL(contents)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()

  URL.revokeObjectURL(url)
}
