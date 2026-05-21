import JSZip from "jszip"
import * as xmljs from "xml-js"

export async function processPPTX(blob: Blob) {
  const arrayBuffer = await blob.arrayBuffer()

  const zip = await JSZip.loadAsync(arrayBuffer)

  let fullText = ""

  const slideFiles = Object.keys(zip.files).filter(file =>
    file.startsWith("ppt/slides/slide")
  )

  for (const slidePath of slideFiles) {
    const slideXml = await zip.files[slidePath].async("text")

    const parsed = xmljs.xml2js(slideXml, {
      compact: true
    }) as any

    const texts: string[] = []

    const extractText = (obj: any) => {
      if (!obj || typeof obj !== "object") return

      for (const key in obj) {
        if (key === "a:t") {
          if (Array.isArray(obj[key])) {
            obj[key].forEach((t: any) => {
              if (t._text) texts.push(t._text)
            })
          } else if (obj[key]._text) {
            texts.push(obj[key]._text)
          }
        }

        extractText(obj[key])
      }
    }

    extractText(parsed)

    fullText += texts.join(" ") + "\n"
  }

  return [
    {
      content: fullText,
      tokens: fullText.length
    }
  ]
}
