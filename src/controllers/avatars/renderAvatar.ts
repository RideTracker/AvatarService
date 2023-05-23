import { AvatarLayer } from "../../models/AvatarLayers";

declare const document: any;
declare const Image: any;

export default function renderAvatar(layers: AvatarLayer[]) {
    return new Promise(async (resolve, reject) => {
        try {
            const size = 250;
        
            const canvas = document.createElement("canvas");
        
            canvas.width = size;
            canvas.height = size;
        
            const context = canvas.getContext("2d");
    
            const images = await Promise.all(layers.map((layer) => {
                return new Promise((resolve, reject) => {
                    const image = new Image();
        
                    image.onload = () => resolve(image);
                    image.onerror = () => reject();
        
                    image.crossOrigin = "anonymous";
                    image.src = layer.image;
                });
            }));
    
    
            layers.forEach((layer, index) => {
                let image: any = images[index];
    
                if(layer.color) {
                    const imageCanvas = document.createElement("canvas");
    
                    imageCanvas.width = image.width;
                    imageCanvas.height = image.height;
    
                    const imageContext = imageCanvas.getContext("2d");
    
                    imageContext.drawImage(image, 0, 0, imageCanvas.width, imageCanvas.height);
    
                    imageContext.globalCompositeOperation = "multiply";
                    imageContext.fillStyle = layer.color;
                    imageContext.fillRect(0, 0, imageCanvas.width, imageCanvas.height);
    
                    imageContext.globalCompositeOperation = "destination-in";
                    imageContext.drawImage(image, 0, 0, imageCanvas.width, imageCanvas.height);
    
                    image = imageCanvas;
                }
    
                context.drawImage(image, 0, 0, canvas.width, canvas.height);
            });
    
            resolve(canvas.toDataURL("image/png"));
        }
        catch(error) {
            reject(error);
        }
    });
};
