import { createContext } from 'react'

const MyContext = createContext<
  [
    boolean, //nextQuestion
    React.Dispatch<React.SetStateAction<boolean>>,
    boolean, //overComponents
    React.Dispatch<React.SetStateAction<boolean>>,
    boolean, //showIcon
    React.Dispatch<React.SetStateAction<boolean>>,
    string, //selectedValue
    React.Dispatch<React.SetStateAction<string>>,
    { x: number; y: number }, // buttonPosition
    React.Dispatch<React.SetStateAction<{ x: number; y: number }>>,
  ]
>([
  false,
  () => {},
  false,
  () => {},
  false,
  () => {},
  '',
  () => {},
  { x: 0, y: 0 },
  () => {},
])

export default MyContext
