import * as XLSX from "xlsx"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { CHUNK_OVERLAP, CHUNK_SIZE } from "."

export const processXLSX = async (blob: Blob) => {
  const arrayBuffer = await blob.arrayBuffer()

  const workbook = XLSX.read(arrayBuffer, {
    type: "array"
  })

  let fullText = ""

  workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName]

    const csv = XLSX.utils.sheet_to_csv(worksheet)

    fullText += "\n" + csv
  })

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP
  })

  const texts = await splitter.splitText(fullText)

  return texts.map(text => ({
    content: text,
    tokens: text.length
  }))
}
