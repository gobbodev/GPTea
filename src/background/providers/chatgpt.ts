import ExpiryMap from 'expiry-map'
import { v4 as uuidv4 } from 'uuid'
import { fetchSSE } from '../fetch-sse'
import { GenerateAnswerParams, Provider } from '../types'

async function request(token: string, method: string, path: string, data?: unknown) {
  return fetch(`https://chat.openai.com/backend-api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: data === undefined ? undefined : JSON.stringify(data),
  })
}

export async function setConversationProperty(
  token: string,
  conversationId: string,
  propertyObject: object,
) {
  await request(token, 'PATCH', `/conversation/${conversationId}`, propertyObject)
}

// Define uma constante para a chave do token de acesso
const KEY_ACCESS_TOKEN = 'accessToken';

// Cria uma nova instância de um ExpiryMap que armazena valores com tempo de expiração
const cache = new ExpiryMap(10 * 1000);

// Cria uma função assíncrona que retorna uma Promise que resolve com o token de acesso
export async function getChatGPTAccessToken(): Promise<string> {
  // Verifica se o token de acesso já está armazenado em cache
  if (cache.get(KEY_ACCESS_TOKEN)) {
    // Retorna o token de acesso do cache se ele existir
    return cache.get(KEY_ACCESS_TOKEN);
  }

  // Se o token de acesso não estiver em cache, faz uma requisição para a API da OpenAI
  const resp = await fetch('https://chat.openai.com/api/auth/session');

  // Se a resposta da requisição retornar um código 403, lança um erro informando que a requisição foi bloqueada pelo Cloudflare
  if (resp.status === 403) {
    throw new Error('CLOUDFLARE');
  }

  // Extrai o corpo da resposta da requisição como JSON
  const data = await resp.json().catch(() => ({}));

  // Se não houver um token de acesso no corpo da resposta, lança um erro de autenticação não autorizada
  if (!data.accessToken) {
    throw new Error('UNAUTHORIZED');
  }

  // Armazena o token de acesso em cache
  cache.set(KEY_ACCESS_TOKEN, data.accessToken);

  // Retorna o token de acesso
  return data.accessToken;
}

export class ChatGPTProvider implements Provider {
  // pega o token que vem de getChatGPTAccessToken() dentro de generateAnswers()
  constructor(private token: string) {
    this.token = token
  }

  private async fetchModels(): Promise<
    { slug: string; title: string; description: string; max_tokens: number }[]
  > {
    const resp = await request(this.token, 'GET', '/models').then((r) => r.json())
    return resp.models
  }

  private async getModelName(): Promise<string> {
    try {
      const models = await this.fetchModels()
      return models[0].slug
    } catch (err) {
      console.error(err)
      return 'text-davinci-002-render'
    }
  }

  async generateAnswer(params: GenerateAnswerParams) {
    let conversationId: string | undefined

    const cleanup = () => {
      if (conversationId) {
        setConversationProperty(this.token, conversationId, { is_visible: false })
      }
    }

    const modelName = await this.getModelName()
    console.debug('Using model:', modelName)

    await fetchSSE('https://chat.openai.com/backend-api/conversation', {
      method: 'POST',
      signal: params.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({
        action: 'next',
        messages: [
          {
            id: uuidv4(),
            role: 'user',
            content: {
              content_type: 'text',
              parts: [params.prompt],
            },
          },
        ],
        model: modelName,
        parent_message_id: uuidv4(),
      }),
      onMessage(message: string) {
        console.debug('sse message', message)
        if (message === '[DONE]') {
          params.onEvent({ type: 'done' })
          cleanup()
          return
        }
        let data
        try {
          data = JSON.parse(message)
        } catch (err) {
          console.error(err)
          return
        }
        const text = data.message?.content?.parts?.[0]
        if (text) {
          conversationId = data.conversation_id
          params.onEvent({
            type: 'answer',
            data: {
              text,
              messageId: data.message.id,
              conversationId: data.conversation_id,
            },
          })
        }
      },
    })
    return { cleanup }
  }
}
