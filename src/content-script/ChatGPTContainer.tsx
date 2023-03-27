import { useState } from 'react'
import ChatGPTCard from './ChatGPTCard'
import MyContext from './context'

function ChatGPTContainer() {
  const [showIcon, setShowIcon] = useState(false)
  const [nextQuestion, setNextQuestion] = useState(false)
  const [overComponents, setOverComponents] = useState(false)
  const [selectedValue, setSelectedValue] = useState('English')
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 })

  const container = document.querySelector('.chat-gpt-container') as HTMLDivElement
  if(container){
    container.style.top = `${buttonPosition.y}px`
    container.style.left = `${buttonPosition.x}px`
  }
  
  return (
    <MyContext.Provider
      value={[
        nextQuestion,
        setNextQuestion,
        overComponents,
        setOverComponents,
        showIcon,
        setShowIcon,
        selectedValue,
        setSelectedValue,
        buttonPosition,
        setButtonPosition,
      ]}
    >
      <ChatGPTCard />
    </MyContext.Provider>
  )
}

export default ChatGPTContainer
