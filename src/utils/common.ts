export function genOptions(items: string[][]) {
  return items.map((item: string[], index: number) => {
    return {
      id: index,
      data: {
        value: item[0],
        content: item[1]
      }
    }
  })
}