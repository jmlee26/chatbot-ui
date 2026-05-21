import JSZip from "jszip"

export async function processPPTX(blob: Blob) {
  const arrayBuffer = await blob.arrayBuffer()

  const zip = await JSZip.loadAsync(arrayBuffer)

  let fullText = ""

  const slideFiles = Object.keys(zip.files).filter(file =>
    file.startsWith("ppt/slides/slide")
  )

  for (const slidePath of slideFiles) {
    const slideXml = await zip.files[slidePath].async("text")

    const matches = slideXml.match(/<a:t>(.*?)<\/a:t>/g)

    if (matches) {
      const texts = matches.map(text =>
        text
          .replace("<a:t>", "")
          .replace("</a:t>", "")
      )

      fullText += texts.join(" ") + "\n"
    }
  }

  return [
    {
      content: fullText,
      tokens: fullText.length
    }
  ]
}
