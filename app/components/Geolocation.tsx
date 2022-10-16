import { useFetcher } from "@remix-run/react";
import { useEffect } from 'react';
import { useGeolocation } from 'react-use';

const Geolocation = () => {
    const geoloc = useGeolocation();
    const fetcher = useFetcher();

    useEffect(() => {
        if (geoloc.latitude && geoloc.longitude) {
            fetcher.submit({
                latitude: String(geoloc.latitude),
                longitude: String(geoloc.longitude)
            }, {
                method: 'post',
                action: "/geolocate"
            });
        }
    }, [geoloc]);

    return null;
}

export default Geolocation;
