export * from '~/utils/geo';

export const randomPick = <T>(values: T[]): T => {
    const index = Math.floor(Math.random() * values.length);
    return values[index];
}
  
export const rgbToHex = (r: number, g: number, b: number): string => '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
  
export const getAverageRGB = (imgEl: HTMLImageElement): {r: number; g: number; b: number;} => {

    const clonedImg = imgEl.cloneNode() as HTMLImageElement;
    const blockSize = 5;
    const defaultRGB = {r:0,g:0,b:0};
    const canvas = document.createElement('canvas');
    const context = canvas.getContext && canvas.getContext('2d');
    const rgb = {r:0,g:0,b:0};
    let data;
    let width;
    let height;
    let length;
    let i = -4;
    let count = 0;

    if (!context) {
        return defaultRGB;
    }

    height = canvas.height = clonedImg.naturalHeight || clonedImg.offsetHeight || clonedImg.height;
    width = canvas.width = clonedImg.naturalWidth || clonedImg.offsetWidth || clonedImg.width;

    context.drawImage(clonedImg, 0, 0);

    try {
        data = context.getImageData(0, 0, width, height);
    } catch(e) {
        console.log(e);
        return defaultRGB;
    }

    length = data.data.length;

    while ( (i += blockSize * 4) < length ) {
        ++count;
        rgb.r += data.data[i];
        rgb.g += data.data[i+1];
        rgb.b += data.data[i+2];
    }

    // ~~ used to floor values
    rgb.r = ~~(rgb.r/count);
    rgb.g = ~~(rgb.g/count);
    rgb.b = ~~(rgb.b/count);

    return rgb;
}

export const getAverageHEX = (imgEl: HTMLImageElement): string => {
    const rgb = getAverageRGB(imgEl);

    return rgbToHex(rgb.r, rgb.g, rgb.b);
};
