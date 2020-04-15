export default ({object, startPoint, mouse, zoom,mouseDir,boundaryBox,bbox}) => {

    let {clientX, clientY} = startPoint;
    if (object.isNew) {
        let width = startPoint.width / zoom + (mouse.x / zoom - clientX * zoom);
        let height = startPoint.height / zoom + (mouse.y / zoom - clientY * zoom);
        return {
            ...object,
            x: clientX * zoom,
            y: clientY * zoom,
            width: width,
            height: height
        };
    } else {

        let width = object.width ;
        let height = object.height;

        let mouseDirX = mouseDir.x;
        let mouseDirY = mouseDir.y;

        if (object.rotate === 0) {
             width = (mouse.x / zoom - startPoint.objectX);
             height = (mouse.y / zoom - startPoint.objectY);
        }
        if (object.rotate > 0||object.rotate < 0) {
            width = (mouse.x/zoom- bbox.left/zoom) + mouseDirX
            height = (mouse.y/zoom- bbox.top/zoom) + mouseDirY
        }

        return {
            ...object,
            x: clientX,
            y: clientY,
            width: width > 5 ? width : 5,
            height: height > 5 ? height : 5
        };
    }
}