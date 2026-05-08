
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

    // [최종 수정] 2026년 최신 모델 명칭과 Stable(v1) 경로 사용
    const modelId = "gemini-3-flash"; 
    const url = `https://generativelanguage.googleapis.com/v1/models/${modelId}:streamGenerateContent?key=${apiKey}`;

    // [수정된 부분] 데이터 구조를 더 직관적이고 안전하게 변경합니다.
    const googlePayload = {
      contents: messages.map(msg => {
        // 1. role 결정 (assistant -> model, 나머지는 user)
        const role = msg.role === "assistant" ? "model" : "user";
        
        // 2. content 추출 (chatbot-ui 버전마다 content 위치가 다를 수 있음)
        // msg.content가 문자열이면 그대로 쓰고, 아니면 parts 내부를 확인
        let messageText = "";
        if (typeof msg.content === "string") {
          messageText = msg.content;
        } else if (Array.isArray(msg.parts) && msg.parts[0]?.text) {
          messageText = msg.parts[0].text;
        } else if (msg.content?.parts?.[0]?.text) {
          messageText = msg.content.parts[0].text;
        }

        return {
          role: role,
          parts: [{ text: messageText || " " }] // 비어있지 않게 최소한의 공백 추가
        };
      }).filter(item => item.parts[0].text.trim() !== ""), // 텍스트가 있는 것만 전송
      
      generationConfig: {
        temperature: chatSettings.temperature || 0.7,
        maxOutputTokens: 4096
      }
    };

    // 만약 contents가 비어버리면 에러가 나므로 최소한의 방어 로직 추가
    if (googlePayload.contents.length === 0) {
       throw new Error("보낼 메시지 내용이 비어있습니다. 입력창을 확인해 주세요.");
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(googlePayload)
    })

    if (!response.ok) {
      const errorJson = await response.json()
      // 에러 메시지 상세 출력 로직
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
