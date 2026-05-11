/*
import { generateLocalEmbedding } from "@/lib/generate-local-embedding"
import {
  processCSV,
  processJSON,
  processMarkdown,
  processPdf,
  processTxt
} from "@/lib/retrieval/processing"
import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { Database } from "@/supabase/types"
import { FileItemChunk } from "@/types"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(req: Request) {
  try {
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const profile = await getServerProfile()

    const formData = await req.formData()

    const file_id = formData.get("file_id") as string
    const embeddingsProvider = formData.get("embeddingsProvider") as string

    const { data: fileMetadata, error: metadataError } = await supabaseAdmin
      .from("files")
      .select("*")
      .eq("id", file_id)
      .single()

    if (metadataError) {
      throw new Error(
        `Failed to retrieve file metadata: ${metadataError.message}`
      )
    }

    if (!fileMetadata) {
      throw new Error("File not found")
    }

    if (fileMetadata.user_id !== profile.user_id) {
      throw new Error("Unauthorized")
    }

    const { data: file, error: fileError } = await supabaseAdmin.storage
      .from("files")
      .download(fileMetadata.file_path)

    if (fileError)
      throw new Error(`Failed to retrieve file: ${fileError.message}`)

    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const blob = new Blob([fileBuffer])
    const fileExtension = fileMetadata.name.split(".").pop()?.toLowerCase()

    if (embeddingsProvider === "openai") {
      try {
        if (profile.use_azure_openai) {
          checkApiKey(profile.azure_openai_api_key, "Azure OpenAI")
        } else {
          checkApiKey(profile.openai_api_key, "OpenAI")
        }
      } catch (error: any) {
        error.message =
          error.message +
          ", make sure it is configured or else use local embeddings"
        throw error
      }
    }

    let chunks: FileItemChunk[] = []

    switch (fileExtension) {
      case "csv":
        chunks = await processCSV(blob)
        break
      case "json":
        chunks = await processJSON(blob)
        break
      case "md":
        chunks = await processMarkdown(blob)
        break
      case "pdf":
        chunks = await processPdf(blob)
        break
      case "txt":
        chunks = await processTxt(blob)
        break
      default:
        return new NextResponse("Unsupported file type", {
          status: 400
        })
    }

    let embeddings: any = []

    let openai
    if (profile.use_azure_openai) {
      openai = new OpenAI({
        apiKey: profile.azure_openai_api_key || "",
        baseURL: `${profile.azure_openai_endpoint}/openai/deployments/${profile.azure_openai_embeddings_id}`,
        defaultQuery: { "api-version": "2023-12-01-preview" },
        defaultHeaders: { "api-key": profile.azure_openai_api_key }
      })
    } else {
      openai = new OpenAI({
        apiKey: profile.openai_api_key || "",
        organization: profile.openai_organization_id
      })
    }

    if (embeddingsProvider === "openai") {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunks.map(chunk => chunk.content)
      })

      embeddings = response.data.map((item: any) => {
        return item.embedding
      })
    } else if (embeddingsProvider === "local") {
      const embeddingPromises = chunks.map(async chunk => {
        try {
          return await generateLocalEmbedding(chunk.content)
        } catch (error) {
          console.error(`Error generating embedding for chunk: ${chunk}`, error)

          return null
        }
      })

      embeddings = await Promise.all(embeddingPromises)
    }

    const file_items = chunks.map((chunk, index) => ({
      file_id,
      user_id: profile.user_id,
      content: chunk.content,
      tokens: chunk.tokens,
      openai_embedding:
        embeddingsProvider === "openai"
          ? ((embeddings[index] || null) as any)
          : null,
      local_embedding:
        embeddingsProvider === "local"
          ? ((embeddings[index] || null) as any)
          : null
    }))

    await supabaseAdmin.from("file_items").upsert(file_items)

    const totalTokens = file_items.reduce((acc, item) => acc + item.tokens, 0)

    await supabaseAdmin
      .from("files")
      .update({ tokens: totalTokens })
      .eq("id", file_id)

    return new NextResponse("Embed Successful", {
      status: 200
    })
  } catch (error: any) {
    console.log(`Error in retrieval/process: ${error.stack}`)
    const errorMessage = error?.message || "An unexpected error occurred"
    const errorCode = error.status || 500
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
*/

import { generateLocalEmbedding } from "@/lib/generate-local-embedding"
import {
  processCSV,
  processJSON,
  processMarkdown,
  processPdf,
  processTxt
} from "@/lib/retrieval/processing"
import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { Database } from "@/supabase/types"
import { FileItemChunk } from "@/types"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import OpenAI from "openai"

// ... 상단 import 생략 ...

// (상단 import 생략 - 이전과 동일)

export async function POST(req: Request) {
  try {
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const profile = await getServerProfile()
    const formData = await req.formData()
    const file_id = formData.get("file_id") as string
    
    const googleApiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY
    const EMBEDDING_MODEL = process.env.NEXT_PUBLIC_EMBEDDING_MODEL_ID || "google-embedding-004"
    const embeddingsProvider = formData.get("embeddingsProvider") as string

    // 1. 파일 메타데이터 가져오기
    const { data: fileMetadata, error: metadataError } = await supabaseAdmin
      .from("files")
      .select("*")
      .eq("id", file_id)
      .single()

    if (metadataError || !fileMetadata) throw new Error("파일 메타데이터를 찾을 수 없습니다.")

    // 2. 스토리지에서 파일 다운로드
    const { data: fileData, error: fileError } = await supabaseAdmin.storage
      .from("files")
      .download(fileMetadata.file_path)

    if (fileError) throw new Error(`파일 다운로드 실패: ${fileError.message}`)

    const fileBuffer = Buffer.from(await fileData.arrayBuffer())
    const blob = new Blob([fileBuffer])
    const fileExtension = fileMetadata.name.split(".").pop()?.toLowerCase()

    // 3. 텍스트 추출 (Chunks 생성)
    let chunks: FileItemChunk[] = []
    switch (fileExtension) {
      case "csv": chunks = await processCSV(blob); break
      case "json": chunks = await processJSON(blob); break
      case "md": chunks = await processMarkdown(blob); break
      case "pdf": chunks = await processPdf(blob); break
      case "txt": chunks = await processTxt(blob); break
      default: throw new Error("지원하지 않는 파일 형식입니다.")
    }

    let embeddings: any = []

    // 4. 임베딩 생성 (Google / OpenAI 분기)
    if (EMBEDDING_MODEL.includes("google")) {
      if (!googleApiKey) throw new Error("GOOGLE_GEMINI_API_KEY가 없습니다.")

      const modelPath = EMBEDDING_MODEL.startsWith("models/") ? EMBEDDING_MODEL : `models/${EMBEDDING_MODEL}`
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/google-embedding-004:batchEmbedContents?key=${googleApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requests: chunks.map(chunk => ({
              model: "models/google-embedding-004", // 모델 경로 명시
              content: { parts: [{ text: chunk.content }] }
            }))
          })
        }
      )
      const data = await response.json()
      if (!response.ok) throw new Error(`Google API Error: ${data.error?.message || response.statusText}`)
      if (!data.embeddings) throw new Error("Google API에서 임베딩 값을 반환하지 않았습니다.")
      
      embeddings = data.embeddings.map((e: any) => e.values)

    } else if (embeddingsProvider === "openai") {
      const openai = new OpenAI({ 
        apiKey: profile.openai_api_key || process.env.OPENAI_API_KEY || "" 
      })
      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: chunks.map(chunk => chunk.content)
      })
      embeddings = response.data.map((item: any) => item.embedding)
    }

    // 5. DB 저장
    const file_items = chunks.map((chunk, index) => ({
      file_id,
      user_id: profile.user_id,
      content: chunk.content,
      tokens: chunk.tokens,
      openai_embedding: embeddings[index] || null 
    }))

    await supabaseAdmin.from("file_items").upsert(file_items)

    // 6. 성공 상태 업데이트 (가장 중요)
    await supabaseAdmin
      .from("files")
      .update({ 
        tokens: file_items.reduce((acc, item) => acc + item.tokens, 0),
        status: "complete" 
      })
      .eq("id", file_id)

    return new NextResponse(JSON.stringify({ message: "Success" }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    })

  } catch (error: any) {
    console.error(error)
    return new Response(JSON.stringify({ message: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}
