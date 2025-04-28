import { fetchNui } from '../fetchNui'

export const onUse = async (item: any) => {
  await fetchNui('useItem', item)
}
