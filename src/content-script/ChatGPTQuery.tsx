import { CheckIcon, CopyIcon, GearIcon } from '@primer/octicons-react'
import { useEffect, useState } from 'preact/hooks'
import { memo, useCallback, useContext } from 'react'
import Browser from 'webextension-polyfill'
import { Answer } from '../messaging'
import MyContext from './context'
import { isBraveBrowser } from './utils.js'

export type QueryStatus = 'success' | 'error' | undefined

interface Props {
  question: string
}

function ChatGPTQuery(props: Props) {
  const [answer, setAnswer] = useState<Answer | null>(null)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [nextQuestion, setNextQuestion, , setOverComponents, , setShowIcon] = useContext(MyContext)
  const [status, setStatus] = useState<QueryStatus>()
  const [isTextCopy, setIsTextCopy] = useState(false)

  // usa o hook useEffect para se conectar com a extensão do navegador e enviar e receber mensagens relacionadas à pergunta
  useEffect(() => {
    if (nextQuestion === false) {
      const port = Browser.runtime.connect()
      const listener = (msg: any) => {
        if (msg.text) {
          setAnswer(msg)
          setStatus('success')
        } else if (msg.error) {
          setError(msg.error)
          setStatus('error')
        } else if (msg.event === 'DONE') {
          setNextQuestion(true)
          setIsTextCopy(false)
        }
      }
      port.onMessage.addListener(listener)
      port.postMessage({ question: props.question })
      return () => {
        port.onMessage.removeListener(listener)
        port.disconnect()
      }
    }
  }, [props.question, retry])

  useEffect(() => {
    const onFocus = () => {
      if (error && (error == 'UNAUTHORIZED' || error === 'CLOUDFLARE')) {
        setError('')
        setRetry((r) => r + 1)
      }
    }
    window.addEventListener('focus', onFocus)

    return () => {
      window.removeEventListener('focus', onFocus)
    }
  }, [error])

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
          <span
            className="copy-icon"
            onClick={() => {
              copyToClipboard()
              setIsTextCopy(true)
              setShowIcon(false)
            }}
          >
            {isTextCopy === false ? <CopyIcon size={14} /> : <CheckIcon size={14} />}
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
