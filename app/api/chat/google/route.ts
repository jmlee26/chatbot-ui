
/*import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { ChatSettings } from "@/types"
import { GoogleGenerativeAI } from "@google/generative-ai"

export const runtime = "edge"

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages } = json as {
    chatSettings: ChatSettings
    messages: any[]
  }

  try {
    const profile = await getServerProfile()

    checkApiKey(profile.google_gemini_api_key, "Google")
    
    const genAI = new GoogleGenerativeAI(profile.google_gemini_api_key || "")
    const googleModel = genAI.getGenerativeModel({ model: chatSettings.model })
   
    
    const lastMessage = messages.pop()

    const chat = googleModel.startChat({
      history: messages,
      generationConfig: {
        temperature: chatSettings.temperature
      }
    })

    const response = await chat.sendMessageStream(lastMessage.parts)

    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response.stream) {
          const chunkText = chunk.text()
          controller.enqueue(encoder.encode(chunkText))
        }
        controller.close()
      }
    })

    return new Response(readableStream, {
      headers: { "Content-Type": "text/plain" }
    })

  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "Google Gemini API Key not found. Please set it in your profile settings."
    } else if (errorMessage.toLowerCase().includes("api key not valid")) {
      errorMessage =
        "Google Gemini API Key is incorrect. Please fix it in your profile settings."
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
*/
import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { ChatSettings } from "@/types"

export const runtime = "edge"

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages } = json as {
    chatSettings: ChatSettings
    messages: any[]
  }

  try {
    const profile = await getServerProfile()
    checkApiKey(profile.google_gemini_api_key, "Google")
    const apiKey = profile.google_gemini_api_key

    // --- [수정 구간 시작] ---
    
    // modelId 매핑 부분을 현재 리스트에 맞게 수정
    let modelId: any = chatSettings.model;
    
    // UI에서 무엇을 선택하든, 현재 사용 가능한 최신 모델로 연결합니다.
    if (modelId.includes("flash")) {
      // 현재 리스트에 있는 Gemini 3 Flash 또는 3.1 Flash Lite 사용
      modelId = "gemini-3-flash"; 
    } else if (modelId.includes("pro")) {
      // Pro 모델 권한이 0/0이라면 실행이 안 될 수 있으니 3 Flash로 우회하거나 확인 필요
      modelId = "gemini-2.5-flash"; 
    } else {
      // 기본값
      modelId = "gemini-3-flash";
    }
    
    // URL은 여전히 v1beta가 가장 안전합니다.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:streamGenerateContent?key=${apiKey}`;
    
    // --- [수정 구간 끝] ---

    const googlePayload = {
      contents: messages.map(msg => {
        const role = msg.role === "assistant" ? "model" : "user"
        const text = typeof msg.content === "string" ? msg.content : msg.parts?.[0]?.text || ""
        
        return {
          role: role,
          parts: [{ text: text }]
        }
      }),
      generationConfig: {
        temperature: chatSettings.temperature || 0.7,
        maxOutputTokens: 2048
      }
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(googlePayload)
    })

    if (!response.ok) {
      const errorJson = await response.json()
      // 구체적인 에러 객체를 문자열로 풀어서 출력
      const detail = errorJson.error?.message || JSON.stringify(errorJson)
      throw new Error(`Google API 호출 실패: ${detail}`)
    }

    return new Response(response.body, {
      headers: { "Content-Type": "text/plain" }
    })

  } catch (error: any) {
    console.error("Gemini Error:", error.message)
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}
