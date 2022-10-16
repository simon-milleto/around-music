import { useEffect, useRef, useState } from "react";

const useAudio = (src: string|null|undefined):
    [() => void, () => void, boolean] => {
    const audioElement = useRef<HTMLAudioElement|null>();
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        audioElement.current = new Audio();
        audioElement.current.onpause = () => {
            setIsPlaying(false);
        };

        audioElement.current.onplay = () => {
            setIsPlaying(true);
        };

        audioElement.current.onended = () => {
            setIsPlaying(false);
        };
    }, []);

    useEffect(() => {
        if (src && audioElement.current) {
            audioElement.current.src = src;
        }
    }, [src]);

    const play = () => {
        if (audioElement.current && src) {
            audioElement.current.play();
        }
    }

    const pause = () => {
        if (audioElement.current && src) {
            audioElement.current.pause();
        }
    }

    return [
        play,
        pause,
        isPlaying
    ]
};

export default useAudio;
