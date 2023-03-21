import { useEffect, useState } from 'preact/hooks'
import { useContext } from 'react'
import defLanguages from '../db/languages.json'
import favicon from '../favicon.png'
import ChatGPTQuery from './ChatGPTQuery'
import MyContext from './context'

interface Language {
  id: number
  name: string
}

function ChatGPTCard() {
  const [triggered, setTriggered] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 })
  const [languages, setLanguages] = useState<Language[]>([])

  const [disableHandleDown, setDisableHandleDown] = useState(false)
  //caixa com opção de select unica para output da tradução
  const [
    ,
    setNextQuestion,
    overComponents,
    setOverComponents,
    showIcon,
    setShowIcon,
    selectedValue,
    setSelectedValue,
  ] = useContext(MyContext)

  useEffect(() => {
    const getSelData = async () => {
      const storedValue = localStorage.getItem('selectedValue')
      if (storedValue) {
        setSelectedValue(storedValue)
      }
    }
    getSelData()
  }, [])
  useEffect(() => {
    const getLanData = async () => {
      const storedLanguage: any = localStorage.getItem('languagesDB')
      if (storedLanguage) {
        const parsedLanguage = await JSON.parse(storedLanguage)
        setLanguages(parsedLanguage[0].languages)
      } else {
        localStorage.setItem('languagesDB', JSON.stringify([defLanguages]))
        setLanguages(defLanguages.languages)
      }
    }
    getLanData()
  }, [])
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
            } else {
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

  const handleSelectChange = (e: any) => {
    const value = e.target.value
    setSelectedValue(value)
    localStorage.setItem('selectedValue', value)
  }

  return (
    <>
      {showIcon && (
        <div
          className="tea-container"
          style={{
            position: 'absolute',
            left: buttonPosition.x,
            top: buttonPosition.y,
          }}
        >
          <div
            className="icon-container"
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
          <div
            className="select-container"
            onMouseOver={() => {
              setDisableHandleDown(true)
            }}
            onMouseLeave={() => {
              setDisableHandleDown(false)
            }}
          >
            <select value={selectedValue} onChange={handleSelectChange} style={{ all: 'revert' }}>
              {languages.map((language) => (
                <option key={language.id}>{language.name}</option>
              ))}
            </select>
          </div>
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
            setOverComponents(false)
          }}
        >
          <ChatGPTQuery
            question={
              'translate this `' +
              selectedText +
              '` to ' +
              selectedValue +
              ' . Your output need to be just the translation, nothing more.'
            }
          />
        </div>
      )}
    </>
  ) //this is on beta test, soon will be support to other languages
}

export default ChatGPTCard
