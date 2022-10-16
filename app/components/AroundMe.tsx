import { useState, useEffect } from 'react';
import type { FullCurrentTrack } from '~/models/user.server';
import Track from '~/components/Track';
import useAudio from '~/components/hooks/useAudio';

type AroundMeProps = {
    tracks: FullCurrentTrack[];
    currentUserTrack: FullCurrentTrack | null;
}

const AroundMe = ({ tracks, currentUserTrack }: AroundMeProps ) => {
    const [trackPlaying, setTrackPlaying] = useState<FullCurrentTrack|null>(null);
    const [play, pause, isPlaying] = useAudio(trackPlaying?.Track.previewUrl);

    useEffect(() => {
        if (trackPlaying) {
            play();
        }
    }, [trackPlaying]);

    const handleOnPlay = (track: FullCurrentTrack) => {
        if (track.id === trackPlaying?.id) {
            pause();
            setTrackPlaying(null);
        } else {
            setTrackPlaying(track);
        }
    }

    return (
        <div className='relative w-full grid grid-rows-3 grid-cols-3 items-center'>
            {currentUserTrack ? (
                <Track 
                    track={currentUserTrack}
                    className="col-start-2 row-start-2"
                    onPlayButton={handleOnPlay}
                    isPlaying={isPlaying && trackPlaying?.id === currentUserTrack.id}
                     />
            ) : null}
            {tracks.map((track) => (
                <Track
                    key={track.id}
                    track={track}
                    onPlayButton={handleOnPlay}
                    isPlaying={isPlaying && trackPlaying?.id === track.id}
                    size="sm" />   
            ))}
        </div>
    )
}

export default AroundMe;