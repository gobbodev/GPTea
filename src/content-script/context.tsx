import { createContext } from 'react'

const MyContext = createContext<
  [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>,
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>,
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>
  ]
>([false, () => {}, false, () => {}, false, () => {}])

export default MyContext
