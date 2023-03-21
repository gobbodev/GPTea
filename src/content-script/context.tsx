import { createContext } from 'react'

const MyContext = createContext<
  [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>,
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>,
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>,
    string,
    React.Dispatch<React.SetStateAction<string>>
  ]
>([false, () => {}, false, () => {}, false, () => {}, "", () => {}])

export default MyContext
