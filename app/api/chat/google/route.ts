
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

    // 1. [최종 모델 ID] v1 정식 버전에서 인식하는 최신 명칭
    const modelId = "gemini-3-flash-latest"; 

    // 2. [최종 URL] 정식 안정 버전인 v1 사용
    const url = `https://generativelanguage.googleapis.com/v1/models/${modelId}:streamGenerateContent?key=${apiKey}`;

    // 3. [메시지 구조 보정] 400 에러(contents missing) 방지를 위한 정밀 추출
    const googlePayload = {
      contents: messages.map(msg => {
        const role = msg.role === "assistant" ? "model" : "user";
        
        // 텍스트 추출 (문자열, parts 배열, content.parts 배열 모두 대응)
        let text = "";
        if (typeof msg.content === "string") {
          text = msg.content;
        } else if (msg.parts?.[0]?.text) {
          text = msg.parts[0].text;
        } else if (msg.content?.parts?.[0]?.text) {
          text = msg.content.parts[0].text;
        }

        return {
          role: role,
          parts: [{ text: text || " " }] 
        };
      }).filter(item => item.parts[0].text.trim() !== ""),
      generationConfig: {
        temperature: chatSettings.temperature || 0.7,
        maxOutputTokens: 4096
      }
    };

    // 데이터가 비었을 경우 방어 로직
    if (googlePayload.contents.length === 0) {
      throw new Error("전송할 메시지 내용이 없습니다.");
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(googlePayload)
    })

    if (!response.ok) {
      const errorJson = await response.json()
      const detail = errorJson.error?.message || JSON.stringify(errorJson)
      throw new Error(`Google API 호출 실패: ${detail}`)
    }

    // 스트리밍 응답 반환
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
