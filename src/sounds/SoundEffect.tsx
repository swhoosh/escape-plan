import bubbleSFX from './bubble.mp3'
import drumSFX from './drum.mp3'
import minionSFX from './minion.mp3'
import popUpOnSFX from './pop-up-on.mp3'
import searchingSFX from './searching.mp3'

const SoundEffect = () => {
    const bubble = new Audio(bubbleSFX);
    const drum = new Audio(drumSFX);
    const minion = new Audio(minionSFX);
    const popUp = new Audio(popUpOnSFX);
    const searching = new Audio (searchingSFX);

    bubble.play();
}

export default SoundEffect;