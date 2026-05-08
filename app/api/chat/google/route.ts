
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

    // 1. 모델 ID 결정: 
    // Vercel 환경변수(GOOGLE_GEMINI_MODEL)가 있으면 그것을 강제로 쓰고,
    // 없으면 UI에서 사용자가 클릭한 모델(chatSettings.model)을 그대로 사용합니다.
    const modelId = process.env.GOOGLE_GEMINI_MODEL || chatSettings.model;

    // 2. URL 생성: v1beta 경로를 유지하되 위에서 결정된 modelId를 넣습니다.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:streamGenerateContent?key=${apiKey}`;

    // [최종 보정] 어떤 구조에서든 텍스트를 반드시 찾아내는 로직
    const googlePayload = {
      contents: messages
        .map(msg => {
          const role = msg.role === "assistant" ? "model" : "user";
          
          // 텍스트 추출을 위한 다각도 탐색
          let text = "";
          if (typeof msg.content === "string") {
            text = msg.content;
          } else if (msg.parts && msg.parts[0]?.text) {
            text = msg.parts[0].text;
          } else if (msg.content?.parts && msg.content.parts[0]?.text) {
            text = msg.content.parts[0].text;
          } else if (msg.content?.text) {
            text = msg.content.text;
          }

          return {
            role: role,
            parts: [{ text: text.trim() || " " }] // 빈 텍스트 방지용 공백
          };
        })
        .filter(item => item.parts[0].text.trim() !== ""), // 유효한 내용만 필터링

      generationConfig: {
        temperature: chatSettings.temperature || 0.7,
        maxOutputTokens: 4096
      }
    };

    // 만약 필터링 후 내용이 하나도 없다면 에러 발생 (빈 요청 방지)
    if (googlePayload.contents.length === 0) {
      throw new Error("보낼 메시지 내용이 비어있습니다. 입력창에 내용을 작성해 주세요.");
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
