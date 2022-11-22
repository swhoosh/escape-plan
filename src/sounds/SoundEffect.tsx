import bubbleSFX from './bubble.mp3'
import drumSFX from './drum.mp3'
import minionSFX from './minion.mp3'
import popUpOnSFX from './pop-up-on.mp3'
import popUpSFX from './pop-up.mp3'
import searchingSFX from './searching.mp3'
import clickSFX from './click.mp3'

export const ClickTile = () => {
  const music = new Audio(clickSFX)
  music.play()
}

export const Bubble = () => {
  const bubble = new Audio(bubbleSFX)
  bubble.play()
}

export const Drum = () => {
  const music = new Audio(drumSFX)
  music.play()
}

export const Minion = () => {
  const music = new Audio(minionSFX)
  music.play()
}

export const PopUpOn = () => {
  const music = new Audio(popUpOnSFX)
  music.play()
}

export const PopUp = () => {
  const music = new Audio(popUpSFX)
  music.play()
}

export const searching = () => {
  const music = new Audio(searchingSFX)
  music.play()
}
