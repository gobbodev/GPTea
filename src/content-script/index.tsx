import { render } from 'preact'
import '../base.css'
import { getUserConfig, Theme } from '../config'
import { detectSystemColorScheme } from '../utils'
import ChatGPTCard from './ChatGPTCard'
import ChatGPTContainer from './ChatGPTContainer'
import MyContext from './context'
import './styles.scss'

async function mount() {
  const container = document.createElement('div')
  container.className = 'chat-gpt-container'
  
  
  const userConfig = await getUserConfig() // tem como n pegar a config 1 milhao de vezes? isso serve para várias outras funções nesse codigo
  let theme: Theme
  if (userConfig.theme === Theme.Auto) {
    theme = detectSystemColorScheme()
  } else {
    theme = userConfig.theme
  }
  if (theme === Theme.Dark) {
    container.classList.add('gpt-dark')
  } else {
    container.classList.add('gpt-light')
  }
  document.body.appendChild(container)

  //cria a sideBar baseada no siteConfig

  // renderiza o componente html
  render(
    //pega a questão que vem de mount e manda para o ChatGPTContainer
    
      <ChatGPTContainer />,container
  )
}

async function run() {
  // pega o element

  console.debug('Mount ChatGPT on')
  //pega a config que retornar de getUserConfig()
  const userConfig = await getUserConfig()
  // se a linguagem for auto mantém o valor do input e se n for adiciona "in " `userConfig.language`

  mount() //pega a questão que vem de searchValueWithLanguageOption e manda para mount
}

run()
