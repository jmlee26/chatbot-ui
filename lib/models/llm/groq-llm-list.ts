/*
import { LLM } from "@/types"

const GROQ_PLATORM_LINK = "https://groq.com/"

const LLaMA3_8B: LLM = {
  modelId: "llama3-8b-8192",
  modelName: "LLaMA3-8b-chat",
  provider: "groq",
  hostedId: "llama3-8b-8192",
  platformLink: GROQ_PLATORM_LINK,
  imageInput: false,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 0.05,
    outputCost: 0.1
  }
}

const LLaMA3_70B: LLM = {
  modelId: "llama3-70b-8192",
  modelName: "LLaMA3-70b-chat",
  provider: "groq",
  hostedId: "llama3-70b-4096",
  platformLink: GROQ_PLATORM_LINK,
  imageInput: false,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 0.59,
    outputCost: 0.79
  }
}

const MIXTRAL_8X7B: LLM = {
  modelId: "mixtral-8x7b-32768",
  modelName: "Mixtral-8x7b-Instruct-v0.1",
  provider: "groq",
  hostedId: "mixtral-8x7b-32768",
  platformLink: GROQ_PLATORM_LINK,
  imageInput: false,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 0.27,
    outputCost: 0.27
  }
}

const GEMMA_7B_IT: LLM = {
  modelId: "gemma-7b-it",
  modelName: "Gemma-7b-It",
  provider: "groq",
  hostedId: "gemma-7b-it",
  platformLink: GROQ_PLATORM_LINK,
  imageInput: false,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 0.15,
    outputCost: 0.15
  }
}

export const GROQ_LLM_LIST: LLM[] = [
  LLaMA3_8B,
  LLaMA3_70B,
  MIXTRAL_8X7B,
  GEMMA_7B_IT
]
*/
import { LLM } from "@/types"

const GROQ_PLATORM_LINK = "https://groq.com/"

// LLaMA 3.1 8B (대체 모델 - 작동 확인됨)
const LLaMA3_1_8B: LLM = {
  modelId: "llama-3.1-8b-instant",
  modelName: "LLaMA 3.1 8B",
  provider: "groq",
  hostedId: "llama-3.1-8b-instant",
  platformLink: GROQ_PLATORM_LINK,
  imageInput: false,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 0.05,
    outputCost: 0.08
  }
}

// LLaMA 3.3 70B (최신 고성능 모델)
const LLaMA3_3_70B: LLM = {
  modelId: "llama-3.3-70b-versatile",
  modelName: "LLaMA 3.3 70B",
  provider: "groq",
  hostedId: "llama-3.3-70b-versatile",
  platformLink: GROQ_PLATORM_LINK,
  imageInput: false,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 0.59,
    outputCost: 0.79
  }
}

const MIXTRAL_8X7B: LLM = {
  modelId: "mixtral-8x7b-32768",
  modelName: "Mixtral-8x7b-Instruct-v0.1",
  provider: "groq",
  hostedId: "mixtral-8x7b-32768",
  platformLink: GROQ_PLATORM_LINK,
  imageInput: false,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 0.27,
    outputCost: 0.27
  }
}

// Gemma 2 9B (최신 Google 모델)
const GEMMA2_9B_IT: LLM = {
  modelId: "gemma2-9b-it",
  modelName: "Gemma 2 9B",
  provider: "groq",
  hostedId: "gemma2-9b-it",
  platformLink: GROQ_PLATORM_LINK,
  imageInput: false,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 0.20,
    outputCost: 0.20
  }
}

export const GROQ_LLM_LIST: LLM[] = [
  LLaMA3_1_8B,
  LLaMA3_3_70B,
  MIXTRAL_8X7B,
  GEMMA2_9B_IT
]
