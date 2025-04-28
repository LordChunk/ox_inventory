import { fetchNui } from '../fetchNui'

export const onGive = async (item: any) => {
  await fetchNui('giveItem', item)
}
