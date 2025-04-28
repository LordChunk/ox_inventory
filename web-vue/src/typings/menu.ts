export interface Button {
  label: string
  index: number
  group?: string
}

export interface ButtonGroup {
  groupName: string | null
  buttons: (Button & { index: number })[]
}