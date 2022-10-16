export const deg2rad = (angle: number): number => {
    return angle * (Math.PI / 180);
  }
  
export const rad2deg = (rad: number): number => {
    return rad * 180 / Math.PI;
}
  
export const moveFrom = (lat: number, lng: number, distance: number, bearing: number): {lat: number; lng: number} => {
    const dR = distance / 6378137.0;
    const cosDr = Math.cos(dR);
    const sinDr = Math.sin(dR);
  
    const phi1 = deg2rad(lat);
    const lambda1 = deg2rad(lng);
  
    const phi2 = Math.asin(
        Math.sin(phi1) * cosDr
        + Math.cos(phi1) * sinDr * Math.cos(bearing)
    );
    const lambda2 = lambda1 + Math.atan2(
        Math.sin(bearing) * sinDr * Math.cos(phi1),
        cosDr - Math.sin(phi1) * Math.sin(phi2)
    );
  
    return {
      lat: rad2deg(phi2),
      lng: rad2deg(lambda2)
    };
}

export default {
    deg2rad,
    rad2deg,
    moveFrom
}