// Avaliable globals:
// ctx (rendering context)
// width, height (the width and height of the window)
const matrixSize = 16
const white = 'rgb(255,255,255, .01)'
const black = 'rgb(0,0,0, .03)'
const blue = '#3646be80'
const pink = '#ca4eb330'
const dataLength = 100
const noteSize = 45
const offsetX = Math.hypot(noteSize, noteSize)
const offsetY = Math.hypot(noteSize, noteSize)
let colIndex = []
let drawingWidth = ((matrixSize * noteSize) + offsetX)
let drawingHeight = drawingWidth 

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function checkIndex(array, x, y) {
  for (let i = 0; i < array.length; i++) {
    if(array[i][0] === x && array[i][1] === y) {
      return true
    } 
  }
  return false
}

function createBackground() {
  var c = document.getElementById("canvas");
  gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#6a4b7410');
  gradient.addColorStop(1, '#88557010');  
  ctx.fillStyle = gradient;
  // ctx.fillStyle = 'rgb(125,94,266, .01)'
  ctx.fillRect(0, 0, width, height)
}

function renderCol(x) {

}

function renderMatrix() {
  for (let x=0; x < matrixSize; x++) {
    for (let y = 0; y < matrixSize; y++) {
      if (checkIndex(colIndex, x, y)) {
        ctx.fillStyle = 'hotpink'
        // ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)]
        ctx.strokeStyle = white
        ctx.lineWidth=1;

        drawRotatedSquare(45, x*offsetX, y*offsetY, noteSize, noteSize)
        
        // console.log(rowIndex)
      } else {
        ctx.fillStyle=white
        ctx.strokeStyle = white
        ctx.lineWidth=1;

        drawRotatedSquare(45, x*offsetX, y*offsetY, noteSize, noteSize)
      }
    }
  }
}


function drawRotatedSquare(angle, x, y, w, h) {
  let randy = Math.round(Math.random()*13)
  // let randx = Math.round(Math.random()*5)
  ctx.save()
  // ctx.translate()
  ctx.translate(x, y)
  ctx.rotate(angle*Math.PI/180)
  ctx.fillRect(-w/2+randy, -h/2+randy, w, h)
  // ctx.strokeRect(-w/2, -h/2, w+test, h+test);
  ctx.restore()
}

function addCoord(x, y) {
  colIndex.push([y, x])
  colIndex.length > dataLength ? colIndex.splice(-1, 1) : null  
}

function removeCoord(x, y) {
  for (let i = 0; i < colIndex.length; i++) {
    if (colIndex[i][0] === y && colIndex[i][1] === x) {
      colIndex.splice(i, 1)
    }
  }
}

function clearCoords() {
  colIndex = []
}

function frame() {
  createBackground()
  renderMatrix()
  requestAnimationFrame(frame)
}

frame()
