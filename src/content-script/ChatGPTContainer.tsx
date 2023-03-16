import { useState } from 'react'
import ChatGPTCard from './ChatGPTCard'
import MyContext from './context'
// Importa o tipo QueryStatus do módulo ./ChatGPTQuery, que define os possíveis estados da consulta ao GPT-3
// Importa o componente Promotion do módulo ./Promotion, que renderiza uma promoção baseada na resposta do GPT-3

function ChatGPTContainer() {
  const [nextQuestion, setNextQuestion] = useState(false)
  const [overComponents, setOverComponents] = useState(false)
  return (
    <MyContext.Provider value={[nextQuestion, setNextQuestion, overComponents, setOverComponents]}>
      <ChatGPTCard />
    </MyContext.Provider>
  )
}

export default ChatGPTContainer
