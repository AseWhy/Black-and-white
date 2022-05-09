export function average(arr: number[]) {
    return arr.reduce((sume, el) => sume + (isNaN(el) ? 0 : el), 0) / arr.length;
}

export function decImage(image: HTMLImageElement): Float32Array {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = image.width;
    canvas.height = image.height;

    context.drawImage(image, 0, 0);

    const data = context.getImageData(0, 0, canvas.width, canvas.height);

    const ret = [];

    for(let i = 0, leng = data.data.length;i < leng;i += 4){
        const y = Math.floor((i / 4) / data.width);
        const x = (i / 4) - (y * data.width);
        
        if(data.data[i+3] === 255 && Math.random() > 0.5 && (data.data[i] > 10) && (data.data[i+1] > 10) && (data.data[i+2] > 10)){
            ret.push(
                x - (data.width/2),
                - y + (data.height/2),
                (
                    (
                        (
                            data.data[i] + data.data[i + 1] + data.data[i + 2]
                        ) / 765
                    ) * 200
                ) - (200 / 2)
            )
        }
    }

    return new Float32Array(ret);
}

export function getRect(data: string): Promise<any>{
    return new Promise((res, rej) => {
        const img = new Image();

        img.src = data;

        img.onload = function(){
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
        
            canvas.width = img.width;
            canvas.height = img.height;
        
            context.drawImage(img, 0, 0);
        
            const data = context.getImageData(0, 0, canvas.width, canvas.height);

            const dec = {
                min: {
                    x: Infinity,
                    y: Infinity
                },
                max: {
                    x: 0x0,
                    y: 0x0
                }
            };

            for(let i = 0, leng = data.data.length;i < leng;i += 4){
                if(data.data[i] + data.data[i+1] + data.data[i+2] + data.data[i+3] !== 0){
                    const y = Math.floor((i / 4) / data.width);
                    const x = (i / 4) - (y * data.width);

                    if(dec.min.x > x) {
                        dec.min.x = x;
                    }
                    
                    if(dec.min.y > y) {
                        dec.min.y = y;
                    }

                    if(dec.max.x < x) {
                        dec.max.x = x;
                    }

                    if(dec.max.y < y) {
                        dec.max.y = y;
                    }
                }
            }

            res({
                x: dec.max.x - dec.min.x,
                y: dec.max.y - dec.min.y
            })
        }
    })
}

export function toDataURL(url: string, callback: Function) {
    const xhr = new XMLHttpRequest();

    xhr.onload = function() {
        const reader = new FileReader();

        reader.onloadend = function() {
            callback(reader.result);
        }

        reader.readAsDataURL(xhr.response);
    };

    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
}