import { DiffAddedIcon } from '@primer/octicons-react'
import { useEffect, useState } from 'preact/hooks'
import { useContext } from 'react'
import Browser from 'webextension-polyfill'
import defLanguages from '../db/languages.json'
import favicon from '../favicon.png'
import ChatGPTQuery from './ChatGPTQuery'
import MyContext from './context'
interface Language {
  id: number
  name: string
}
interface LanguageData {
  languages: Language[];
}
function ChatGPTCard() {
  const [triggered, setTriggered] = useState(false)
  const [selectFrom, setSelectFrom] = useState('')
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 })
  const [languages, setLanguages] = useState<Language[]>([])
  const [selectFocused, setSelectFocused] = useState(false)
  const [showAddBtn, setShowAddBtn] = useState(false)
  const [showAddInput, setShowAddInput] = useState(false)
  const [marginTopSVG, setMarginTopSVG] = useState(123)

  const [disableHandleDown, setDisableHandleDown] = useState(false)

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
    const getSelAppData = async () => {
      Browser.storage.local
        .get('selectedValue')
        .then((result: any) => {
          setSelectedValue(result.selectedValue)
        })
        .catch()

      /*//controle de versao do DB local
      Browser.storage.local.get('gpteaVersion').then((result: any) => {
        const manifestVersion = getExtensionVersion();
        if(result.gpteaVersion !== manifestVersion){
          Browser.storage.local.set({gpteaVersion: manifestVersion})
        }
      }).catch(() => {
        Browser.storage.local.set({gpteaVersion: getExtensionVersion()})
      })*/
    }
    getSelAppData()
  }, [])
  useEffect(() => {
    const getLanData = async () => {
      Browser.storage.local
        .get('languagesDB')
        .then((result) => {
          const resultLang = result.languagesDB.languages
          setLanguages(resultLang)
        })
        .catch(() => {
          Browser.storage.local.set({ languagesDB: defLanguages })
          console.log("default: ")
          console.log(defLanguages)
          setLanguages(defLanguages.languages)
        })
    }
    getLanData()
  }, [])
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection()
      setSelectFrom(selection?.toString() || '')
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
      if (selectFrom) {
        setShowIcon(true)
      }
    }
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('selectionchange', handleSelectionChange)
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [selectFrom])

  useEffect(() => {
    const handleMouseDown = () => {
      if (!disableHandleDown) {
        setSelectFrom('')
        setShowIcon(false)
        setShowAddBtn(false)
        setShowAddInput(false)
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
    Browser.storage.local.set({ selectedValue: value })
  }
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const name = formData.get('languageInput') as string
    const newLanguage: Language = { id: languages.length + 1, name }
    const updatedLanguages: LanguageData  = {languages: [...languages, newLanguage]}
    setLanguages([...languages, newLanguage])
    Browser.storage.local.set({languagesDB: updatedLanguages })
    setSelectedValue(name);
    Browser.storage.local.set({ selectedValue: name })
    setMarginTopSVG(marginTopSVG + 16)
    form.reset()
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
            <img alt="GPTea Logo" src={favicon} height={32} width={32} />
          </div>
          <div
            className="select-container"
            onMouseOver={() => {
              setDisableHandleDown(true)
            }}
            onMouseLeave={() => {
              setDisableHandleDown(false)
            }}
            style={
              selectFocused || showAddInput ? { opacity: 1, visibility: 'visible' } : undefined
            }
          >
            <select
              onBlur={() => {
                setSelectFocused(false)
                setShowAddBtn(false)
              }}
              onFocus={() => {
                setSelectFocused(true)
              }}
              onClick={() => {
                setShowAddBtn(!showAddBtn)
                setShowAddInput(false)
              }}
              value={selectedValue}
              onChange={handleSelectChange}
              style={{ all: 'revert' }}
            >
              {languages.map((language) => (
                <option key={language.id}>{language.name}</option>
              ))}
            </select>
          </div>
          <div
            className="add-container"
            style={
               
              showAddInput ? { marginTop: '-15px' } : { marginTop: marginTopSVG.toString() + "px" }}
            onMouseOver={() => {
              setDisableHandleDown(true)
            }}
          >
            <div
              className="svg-container"
              onClick={() => {
                setShowAddInput(true)
                setShowAddBtn(false)
              }}
              style={showAddBtn ? { visibility: 'visible', opacity: 1 } : undefined}
            >
              <DiffAddedIcon fill="#dfdfdf" size={18} />
            </div>
            <form
              onSubmit={handleSubmit}
              style={showAddInput ? { visibility: 'visible', opacity: 1 } : undefined}
            >
              <input
                placeholder="New language"
                type="text"
                id="languageInput"
                name="languageInput"
                required
              />
              <button
                type="submit"
                onClick={() => {
                  setShowAddInput(false)
                  setSelectFocused(true)
                }}
              >
                Add
              </button>
            </form>
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
              selectFrom +
              '` to ' +
              selectedValue +
              ' . Your output need to be just the translation, nothing more.'
            }
          />
        </div>
      )}
    </>
  )
}

export default ChatGPTCard
