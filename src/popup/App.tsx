import { MarkGithubIcon , GlobeIcon } from '@primer/octicons-react'
import './styles.scss'

function App() {
  return (
    <>
      <div className="app-header">
        <h1>GPTea - Take a Tea with ChatGPT</h1>
      </div>
      <div className="content">
        <div className="links-container">
          <a target={'_blank'} href='https://github.com/gobbodev/GPTea'><MarkGithubIcon  size={16} /> Github</a>
          <a target={'_blank'} href='https://gobbo.dev/'><GlobeIcon size={16} /> My Website</a>
        </div>
        <div className="features-container">
          <h2>Features Coming Soon:</h2>
          <p>
            - Grammar correction
            <br />
            - Output in multiple languages
            <br />
            - Example sentences for words
            <br />
            - Saving translations and example sentences
            <br />
            - Translation by explicit input (not just by selection)
            <br />
          </p>
        </div>
      </div>
    </>
  )
}

export default App
