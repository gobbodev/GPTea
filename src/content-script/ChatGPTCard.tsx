import { useEffect, useState } from 'preact/hooks'
import { useContext } from 'react'
import favicon from '../favicon.png'
import ChatGPTQuery from './ChatGPTQuery'
import MyContext from './context'

function ChatGPTCard() {
  const [triggered, setTriggered] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 })

  const [disableHandleDown, setDisableHandleDown] = useState(false)

  const [, setNextQuestion, overComponents, setOverComponents, showIcon, setShowIcon] =
    useContext(MyContext)

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection()
      setSelectedText(selection?.toString() || '')
      if (selection?.toString()) {
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()

        if (rect.left === 0 && rect.bottom === 0) {
          const container = range.commonAncestorContainer
          const selectedElement = container.nodeType === 1 ? container : container.parentNode

          if (selectedElement) {
            const inputElement = (selectedElement as HTMLElement).querySelector('input')

            if (inputElement) {
              const rect = inputElement.getBoundingClientRect()
              setButtonPosition({ x: rect.left + window.scrollX, y: rect.bottom + window.scrollY })
            } 
            else {
              const textElement = (selectedElement as HTMLElement).querySelector('textarea')
              if (textElement) {
                const rect = textElement.getBoundingClientRect()
                setButtonPosition({
                  x: rect.left + window.scrollX,
                  y: rect.bottom + window.scrollY,
                })
              }
            }
          }
        } else {
          setButtonPosition({ x: rect.left + window.scrollX, y: rect.bottom + window.scrollY })
        }
      }
      console.log('passou')
    }
    const handleMouseUp = () => {
      if (selectedText) {
        setShowIcon(true)
      }
    }
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('selectionchange', handleSelectionChange)
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [selectedText])

  useEffect(() => {
    const handleMouseDown = () => {
      if (!disableHandleDown) {
        setSelectedText('')
        setShowIcon(false)
      }
      if (overComponents === false) {
        setTriggered(false)
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [disableHandleDown, overComponents])

  return (
    <>
      {showIcon && (
        <div
          className="icon-container"
          style={{
            position: 'absolute',
            left: buttonPosition.x,
            top: buttonPosition.y,
          }}
          onClick={() => {
            setTriggered(true)
            setShowIcon(false)
            setNextQuestion(false)
          }}
          onMouseOver={() => {
            setDisableHandleDown(true)
          }}
          onMouseLeave={() => {
            setDisableHandleDown(false)
          }}
        >
          <img alt="GPTea Logo" src={favicon} height={30} width={30} />
        </div>
      )}
      {triggered && (
        <div
          className="query-container markdown-body"
          style={{
            position: 'absolute',
            left: buttonPosition.x,
            top: buttonPosition.y,
          }}
          onMouseOver={() => {
            setOverComponents(true)
          }}
          onMouseLeave={() => {
            setOverComponents(false) //ultima
          }}
        >
          <ChatGPTQuery
            question={
              'translate this to Brazil portuguese: `' +
              selectedText +
              '`. Your output need to be just the translation, nothing more. Example: userInput:`bola`. yourOutput:`ball`.'
            }
          />
        </div>
      )}
    </>
  ) //this is on beta test, soon will be support to other languages
}

export default ChatGPTCard
