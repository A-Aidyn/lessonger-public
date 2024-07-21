function _imageEncode (arrayBuffer) {
    let binary = '';
    let data = new Uint8Array(arrayBuffer);
    for (let i = 0; i < data.length; i ++)
        binary += String.fromCharCode(data[i]);
    return btoa(binary);
}