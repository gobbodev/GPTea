import { useState } from 'react'
import ChatGPTCard from './ChatGPTCard'
import MyContext from './context'

function ChatGPTContainer() {
  const [showIcon, setShowIcon] = useState(false)
  const [nextQuestion, setNextQuestion] = useState(false)
  const [overComponents, setOverComponents] = useState(false)

  return (
    <MyContext.Provider
      value={[
        nextQuestion,
        setNextQuestion,
        overComponents,
        setOverComponents,
        showIcon,
        setShowIcon,
      ]}
    >
      <ChatGPTCard />
    </MyContext.Provider>
  )
}

export default ChatGPTContainer
