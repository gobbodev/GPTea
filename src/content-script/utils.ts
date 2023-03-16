import Browser from 'webextension-polyfill'

// Declara uma função chamada getPossibleElementByQuerySelector que recebe um parâmetro chamado queryArray do tipo string[] e retorna um valor do tipo T ou undefined. T é um tipo genérico que estende Element, ou seja, pode ser qualquer subclasse de Element.
// T deriva de Element, ou seja, pode ser qualquer subclasse de Element. Isso restringe o tipo de elemento que a função pode retornar
// Element = Elemento HTML
export function getPossibleElementByQuerySelector<T extends Element>(
  queryArray: string[],
): T | undefined {
  // Percorre cada string no queryArray usando um laço for...of
  for (const query of queryArray) {
    // Usa o método document.querySelector para buscar o primeiro elemento no documento HTML que corresponde ao seletor CSS na string query e atribui esse elemento à variável element
    const element = document.querySelector(query)
    // Se element não for null ou undefined, significa que encontrou um elemento válido
    if (element) {
      // Retorna element convertido para o tipo T usando a sintaxe as T
      return element as T
    }
  }
  // Se nenhum elemento for encontrado no laço for...of, retorna undefined como resultado da função
}

export function endsWithQuestionMark(question: string) { // é chamada quando TriggerMode = QuestionMark
  return (
    question.endsWith('?') || // ASCII
    question.endsWith('？') || // Chinese/Japanese
    question.endsWith('؟') || // Arabic
    question.endsWith('⸮') // Arabic
  )
}

export function isBraveBrowser() {
  return (navigator as any).brave?.isBrave()
}

export async function shouldShowRatingTip() {
  const { ratingTipShowTimes = 0 } = await Browser.storage.local.get('ratingTipShowTimes')
  if (ratingTipShowTimes >= 5) {
    return false
  }
  await Browser.storage.local.set({ ratingTipShowTimes: ratingTipShowTimes + 1 })
  return ratingTipShowTimes >= 2
}
