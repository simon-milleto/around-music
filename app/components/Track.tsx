import type { FullCurrentTrack } from '~/models/user.server';
import { useRef, useMemo, useState } from 'react';
import { RiShareLine, RiPlayMiniFill, RiPauseMiniFill } from "react-icons/ri";
import { animated, useSpring } from '@react-spring/web';
import { getAverageRGB, rgbToHex } from '~/utils';

type TrackProps = {
    track: FullCurrentTrack;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    onPlayButton: (track: FullCurrentTrack) => void;
    isPlaying?: boolean;
}

type RippleProps = {
    animate: string;
}


const Ripple = ({ animate }: RippleProps) => (
    <span className={`flex flex-col content-center items-center opacity-0 absolute top-0 left-0 right-0 bottom-0 -z-10
        after:content-[''] before:content-[''] h-full w-full border-2 border-black border-opacity-20 rounded-full ${animate}`}></span>
)

const randomIntFromInterval = (min: number, max: number): number => { 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

const sizes = {
    sm: 0.75,
    md: 1,
    lg: 1.2
};

const Track = ({ track, size = 'md', className = '', onPlayButton, isPlaying }: TrackProps ) => {
    const sizeScale = sizes[size];
    const imgRef = useRef<HTMLImageElement|null>(null);
    const [imgLoaded, setImgLoaded] = useState(false);

    const style = useSpring({
        to: { opacity: 1, '--tw-scale-x': sizeScale, '--tw-scale-y': sizeScale },
        from: { opacity: 0, '--tw-scale-x': sizeScale * 0.75, '--tw-scale-y': sizeScale * 0.75 },
        delay: randomIntFromInterval(100, 1000)
    })

    const handlePlayButton = () => {
        onPlayButton!(track);
    }

    const averageRGB = useMemo<{r: number, g: number, b: number}>(() => {
        if (imgLoaded && imgRef.current) {
            return getAverageRGB(imgRef.current);
        }

        return {r: 0, g:0, b:0};
    }, [imgRef, imgLoaded])

    const handleShareButton = async () => {
        try {
            await navigator.share({url: track.Track.link!});
          } catch (err) {
            console.log(err);
          }
    }

    const handleImgLoaded = () => setImgLoaded(true);

    // Tweak tailwind css
    const imgStyle = {
        '--tw-shadow-color': rgbToHex(averageRGB.r, averageRGB.g, averageRGB.b),
        'borderColor': `rgb(${averageRGB.r} ${averageRGB.g} ${averageRGB.b} / var(--tw-border-opacity))`
    } as React.CSSProperties;

    return (
        <animated.div style={style} className={`flex flex-col transform items-center ${className}`}>
            <span className='block text-center font-bold pb-2'>
                {track.Track.name}
            </span>
            <div className='relative'>
                <div className={`${isPlaying ? 'animate-pulse-custom' : ''} relative`}>
                    <img
                        src={track.Track.Album.image}
                        onLoad={handleImgLoaded}
                        style={imgStyle}
                        ref={imgRef}
                        crossOrigin=''
                        className={`shadow-lg shadow-slate-400 border-2 border-slate-700 rounded-full w-[20vw] h-[20vw] max-w-[200px] max-h-[200px] min-w-[100px] min-h-[100px]`}
                        alt={`Album of ${track.Track.Album.name}`} />
                    <button onClick={handleShareButton} className='absolute right-[15%] top-[15%] -translate-y-1/2 translate-x-1/2 z-10 bg-white p-1 rounded-full text-lg border border-slate-700 shadow shadow-black transition active:shadow-none'>
                        <RiShareLine />
                    </button>
                    <button 
                    onClick={handlePlayButton}
                    className='absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 bg-white p-1 rounded-full text-lg border border-slate-700 shadow shadow-black transition active:shadow-none'>
                        {isPlaying ? <RiPauseMiniFill /> : <RiPlayMiniFill />}
                    </button>
                </div>
                {isPlaying ? (<>
                    <Ripple animate='animate-[ripple_2s_ease-in-out_infinite]' />
                    <Ripple animate='animate-[ripple_2s_0.7s_ease-in-out_infinite]' />
                    <Ripple animate='animate-[ripple_2s_1.6s_ease-in-out_infinite]' />
                </>) : null}
            </div>
            <p className='text-center pt-2'>
                <span className='block italic'>
                    {track.Track.artists.map((artist) => artist.name).join(', ')}
                </span>
            </p>
        </animated.div>
    )
}

export default Track;