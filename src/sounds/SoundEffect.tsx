import bubbleSFX from './bubble.mp3'
import drumSFX from './drum.mp3'
import minionSFX from './minion.mp3'
import popUpOnSFX from './pop-up-on.mp3'
import popUpSFX from './pop-up.mp3'
import searchingSFX from './searching.mp3'
import clickSFX from './click.mp3'

export const ClickTile = (isMute: any) => {
  if (isMute) return
  const music = new Audio(clickSFX)
  music.play()
}

export const Bubble = (isMute: any) => {
  if (isMute) return
  const bubble = new Audio(bubbleSFX)
  bubble.play()
}

export const Drum = (isMute: any) => {
  if (isMute) return
  const music = new Audio(drumSFX)
  music.play()
}

export const Minion = (isMute: any) => {
  if (isMute) return
  const music = new Audio(minionSFX)
  music.play()
}

export const PopUpOn = (isMute: any) => {
  if (isMute) return
  const music = new Audio(popUpOnSFX)
  music.play()
}

export const PopUp = (isMute: any) => {
  if (isMute) return
  const music = new Audio(popUpSFX)
  music.play()
}

export const searching = (isMute: any) => {
  if (isMute) return
  const music = new Audio(searchingSFX)
  music.play()
}
