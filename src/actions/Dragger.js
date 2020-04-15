export default ({object, startPoint, mouse, zoom}) => {

  let someX = ((startPoint.objectX + startPoint.width)- mouse.x / zoom);
  let someY = ((startPoint.objectY + startPoint.height)- mouse.y / zoom);
  let mousePosX = startPoint.width * zoom - someX;
  let mousePosY = startPoint.height * zoom - someY;

  return {
    ...object,
     x:  mousePosX + startPoint.objectX,
     y:  mousePosY + startPoint.objectY

  };
};
