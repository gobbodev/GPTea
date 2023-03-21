import { useState } from 'react'
import ChatGPTCard from './ChatGPTCard'
import MyContext from './context'

function ChatGPTContainer() {
  const [showIcon, setShowIcon] = useState(false)
  const [nextQuestion, setNextQuestion] = useState(false)
  const [overComponents, setOverComponents] = useState(false)
  const [selectedValue, setSelectedValue] = useState("English")

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
      ]}
    >
      <ChatGPTCard />
    </MyContext.Provider>
  )
}

export default ChatGPTContainer
