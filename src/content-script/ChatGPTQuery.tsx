import { CopyIcon, GearIcon, CheckIcon } from '@primer/octicons-react'
import { useEffect, useState } from 'preact/hooks'
import { memo, useCallback, useContext } from 'react'
import Browser from 'webextension-polyfill'
import { captureEvent } from '../analytics'
import { Answer } from '../messaging'
import MyContext from './context'
import { isBraveBrowser, shouldShowRatingTip } from './utils.js'

export type QueryStatus = 'success' | 'error' | undefined

interface Props {
  question: string
}

function ChatGPTQuery(props: Props) {
  const [answer, setAnswer] = useState<Answer | null>(null) 
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [done, setDone] = useState(false)
  const [nextQuestion, setNextQuestion, , setOverComponents, , setShowIcon] = useContext(MyContext)
  const [showTip, setShowTip] = useState(false)
  const [status, setStatus] = useState<QueryStatus>()
  const [isTextCopy, setIsTextCopy] = useState(false)

  // usa o hook useEffect para se conectar com a extensão do navegador e enviar e receber mensagens relacionadas à pergunta
  useEffect(() => {
    if (nextQuestion === false) {
      // cria um objeto port para se comunicar com a extensão do navegador
      const port = Browser.runtime.connect()
      // define uma função listener que recebe uma mensagem (msg) como parâmetro
      const listener = (msg: any) => {
        // se a mensagem tem um texto, significa que é uma resposta válida
        if (msg.text) {
          // atualiza o estado answer com a mensagem recebida
          setAnswer(msg)
          setStatus('success')
        } else if (msg.error) {
          // se a mensagem tem um erro, significa que houve algum problema na consulta
          setError(msg.error)
          setStatus('error')
        } else if (msg.event === 'DONE') {
          // se a mensagem tem um evento 'DONE', significa que a consulta foi concluída
          setDone(true)
          setNextQuestion(true)
          setIsTextCopy(false)
        }
      }
      // adiciona um listener ao objeto port para receber mensagens da extensão do navegador
      port.onMessage.addListener(listener)
      // envia uma mensagem ao objeto port com a propriedade question das props
      port.postMessage({ question: props.question })
      // retorna uma função de limpeza que remove o listener do objeto port e desconecta ele
      return () => {
        port.onMessage.removeListener(listener)
        port.disconnect()
      }
    }
  }, [props.question, retry])

  // usa o hook useEffect para tentar novamente em caso de erro quando houver foco na janela
  useEffect(() => {
    // define uma função onFocus que verifica se há algum erro e se ele é do tipo 'UNAUTHORIZED' ou 'CLOUDFLARE'
    const onFocus = () => {
      if (error && (error == 'UNAUTHORIZED' || error === 'CLOUDFLARE')) {
        // limpa o estado error
        setError('')
        // incrementa o estado retry em 1
        setRetry((r) => r + 1)
      }
    }
    // adiciona um listener ao objeto window para executar a função onFocus quando houver um evento de focus
    window.addEventListener('focus', onFocus)
    // retorna uma função de limpeza que remove o listener do objeto window
    return () => {
      window.removeEventListener('focus', onFocus)
    }
  }, [error])

  useEffect(() => {
    shouldShowRatingTip().then((show) => setShowTip(show))
  }, [])

  useEffect(() => {
    if (status === 'success') {
      captureEvent('show_answer', { host: location.host, language: navigator.language })
    }
  }, [props.question, status])

  const openOptionsPage = useCallback(() => {
    Browser.runtime.sendMessage({ type: 'OPEN_OPTIONS_PAGE' })
  }, [])

  const copyToClipboard = () => {
    const text = answer?.text || ''
    navigator.clipboard.writeText(text)
    //alert(`Copied "${text}" to clipboard`)
  }

  if (answer) {
    return (
      <div className="markdown-body gpt-markdown" id="gpt-answer" dir="auto">
        <div className="gpt-header">
          <span className="font-bold">GPTea</span>
          <span className="cursor-pointer leading-[0]" onClick={openOptionsPage}>
            <GearIcon size={14} />
          </span>
        </div>
        <p
          onMouseOver={() => {
            setOverComponents(true)
          }}
        >
          {answer.text}
        </p>
        <div className="copy-container">
          <span className="copy-icon" onClick={() => {
             copyToClipboard()
             setIsTextCopy(true)
             setShowIcon(false)
             }}>
            {isTextCopy === false ? <CopyIcon size={14}/> : <CheckIcon  size={14}/>}
          </span>
        </div>
      </div>
    )
  }

  if (error === 'UNAUTHORIZED' || error === 'CLOUDFLARE') {
    return (
      <p>
        Please login and pass Cloudflare check at{' '}
        <a href="https://chat.openai.com" target="_blank" rel="noreferrer">
          chat.openai.com
        </a>
        {retry > 0 &&
          (() => {
            if (isBraveBrowser()) {
              return (
                <span className="block mt-2">
                  Still not working? Follow{' '}
                  <a href="https://github.com/wong2/chat-gpt-google-extension#troubleshooting">
                    Brave Troubleshooting
                  </a>
                </span>
              )
            } else {
              return (
                <span className="italic block mt-2 text-xs">
                  OpenAI requires passing a security check every once in a while. If this keeps
                  happening, change AI provider to OpenAI API in the extension options.
                </span>
              )
            }
          })()}
      </p>
    )
  }
  if (error) {
    return (
      <p>
        Failed to load response from ChatGPT:
        <span className="break-all block">{error}</span>
      </p>
    )
  }

  return <p className="text-[#b6b8ba] animate-pulse">Waiting for ChatGPT response...</p>
}

export default memo(ChatGPTQuery)
