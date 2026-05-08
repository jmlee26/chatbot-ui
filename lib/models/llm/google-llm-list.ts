/*
import { LLM } from "@/types"

const GOOGLE_PLATORM_LINK = "https://ai.google.dev/"

// Google Models (UPDATED 12/22/23) -----------------------------

// Gemini 1.5 Flash
const GEMINI_1_5_FLASH: LLM = {
  modelId: "gemini-1.5-flash",
  modelName: "Gemini 1.5 Flash",
  provider: "google",
  hostedId: "gemini-1.5-flash",
  platformLink: GOOGLE_PLATORM_LINK,
  imageInput: true
}

// Gemini 1.5 Pro (UPDATED 05/28/24)
const GEMINI_1_5_PRO: LLM = {
  modelId: "gemini-1.5-pro-latest",
  modelName: "Gemini 1.5 Pro",
  provider: "google",
  hostedId: "gemini-1.5-pro-latest",
  platformLink: GOOGLE_PLATORM_LINK,
  imageInput: true
}

// Gemini Pro (UPDATED 12/22/23)
const GEMINI_PRO: LLM = {
  modelId: "gemini-pro",
  modelName: "Gemini Pro",
  provider: "google",
  hostedId: "gemini-pro",
  platformLink: GOOGLE_PLATORM_LINK,
  imageInput: false
}

// Gemini Pro Vision (UPDATED 12/22/23)
const GEMINI_PRO_VISION: LLM = {
  modelId: "gemini-pro-vision",
  modelName: "Gemini Pro Vision",
  provider: "google",
  hostedId: "gemini-pro-vision",
  platformLink: GOOGLE_PLATORM_LINK,
  imageInput: true
}

export const GOOGLE_LLM_LIST: LLM[] = [GEMINI_PRO, GEMINI_PRO_VISION, GEMINI_1_5_PRO, GEMINI_1_5_FLASH]
*/

import { LLM } from "@/types"

const GOOGLE_PLATORM_LINK = "https://ai.google.dev/"

// Google Models (UPDATED 2026/05/08) -----------------------------

// Gemini 3 Flash (최신 메인 모델)
const GEMINI_3_FLASH: LLM = {
  modelId: "gemini-3-flash",
  modelName: "Gemini 3 Flash",
  provider: "google",
  hostedId: "gemini-3-flash",
  platformLink: GOOGLE_PLATORM_LINK,
  imageInput: true
}

// Gemini 3.1 Flash Lite (경량화 모델)
const GEMINI_3_1_FLASH_LITE: LLM = {
  modelId: "gemini-3.1-flash-lite",
  modelName: "Gemini 3.1 Flash Lite",
  provider: "google",
  hostedId: "gemini-3.1-flash-lite",
  platformLink: GOOGLE_PLATORM_LINK,
  imageInput: true
}

const GEMINI_2_5_FLASH: LLM = {
  modelId: "gemini-2.5-flash",
  modelName: "Gemini 2.5 Flash",
  provider: "google",
  hostedId: "gemini-2.5-flash",
  platformLink: GOOGLE_PLATORM_LINK,
  imageInput: true // 2.5 모델도 멀티모달을 지원하므로 true
}


// (참고) 기존 Gemini Pro는 호환성을 위해 남겨두거나 삭제해도 됩니다.
const GEMINI_PRO: LLM = {
  modelId: "gemini-pro",
  modelName: "Gemini Pro (Legacy)",
  provider: "google",
  hostedId: "gemini-pro",
  platformLink: GOOGLE_PLATORM_LINK,
  imageInput: false
}

export const GOOGLE_LLM_LIST: LLM[] = [
  GEMINI_3_FLASH, 
  GEMINI_3_1_FLASH_LITE, 
  GEMINI_PRO,
  GEMINI_2_5_FLASH
]
