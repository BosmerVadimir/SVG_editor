let startAngle= 0;

export default ({object,mouseDir}) => {
  let rotation = startAngle + mouseDir.x * 3;
  startAngle =  rotation;
  if(startAngle >= 360){
    rotation = 0;
    startAngle = 0
  }
  if(startAngle <= -360){
    rotation = 0;
    startAngle = 0
  }
  return {
    ...object,
    rotate: rotation
  };
};
