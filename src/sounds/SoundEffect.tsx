import bubbleSFX from './bubble.mp3'
import drumSFX from './drum.mp3'
import minionSFX from './minion.mp3'
import popUpOnSFX from './pop-up-on.mp3'
import popUpSFX from './pop-up.mp3'
import searchingSFX from './searching.mp3'
import clickSFX from './click.mp3'
import popBubbleSFX from './pop-up-bubble.mp3'

export const Bubble = (mute: boolean) => {
    const music = new Audio(bubbleSFX);
    if (!mute) music.play();
}

export const Drum = (mute: boolean) => {
    const music = new Audio(drumSFX);
    if (!mute) music.play();
}

export const Minion = (mute: boolean) => {
    const music = new Audio(minionSFX);
    if (!mute) music.play();
}

export const PopUpOn = () => {
    const music = new Audio(popUpOnSFX);
    music.play();
}

export const PopUp = (mute: boolean) => {
    const music = new Audio(popUpSFX);
    if (!mute) music.play();
}

export const searching = (mute: boolean) => {
    const music = new Audio(searchingSFX);
    if (!mute) music.play();
}

export const Click = (mute: boolean) => {
    const music = new Audio(clickSFX);
    if (!mute) music.play();
}

export const PopUpBub = (mute: boolean) => {
    const music = new Audio(popBubbleSFX)
    if (!mute) music.play();
}

//comment