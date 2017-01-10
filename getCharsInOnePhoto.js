const Jimp = require('jimp')
const util = require('util')

const imageDir = './test/resource/imagelibrary/imagelibrary/'
let imagePath = imageDir + 'big_ccp_ALL1_nodiff_nzd.png'

//存放某多组像素，每组像素都组成一个汉字
let allCharsPixel = []

//存放已访问过的像素点的数组
let pixelsVisited = {}

Jimp.read(imagePath)
  .then(function (image) {
    let width = image.bitmap.width
    let height = image.bitmap.height

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {

        let pixelColor = image.getPixelColor(x, y)
        let pixel = {
          x: x,
          y: y,
          color: Jimp.intToRGBA(pixelColor)
        }
        visitPixelBeside(pixel)
        if (isBlack(pixel))
          console.log(util.inspect(pixel))
      }
    }
  })
  .catch(function (err) {
    console.log(util.inspect(err))
  })

let isBlack = function (pixel) {
  if (pixel && pixel.color) {
    return (pixel.color.r === 0 && pixel.color.g === 0 && pixel.color.b === 0)
  }
  return false
}


let isPixelVisit = function (pixel, pixelsVisited) {
  let positionString = pixel.x + ',' + pixel.y
  return pixelsVisited[positionString]
}

/**
 *   判断一个像素点是否是黑色像素，如果是黑色像素，则把这个像素点加到allPixelsInOneChar
 *   同时通过递归遍历该像素点周围8个方向的像素点是否是黑色像素，从而把某一个中文汉字中的像素点全部提取出来
 *   （因为是按照，从上到下，从左到右的顺序遍历图片中的所有像素点，所以 ← ↖ ↑ ↗ 这几个方向必定是已经访问过的，
 *   只需要访问→ ↘ ↓ ↙ 即可）
 * @param  {[type]} pixel              [要判断的像素点]
 * @param  {[type]} pixelsVisited      [已访问的像素点]
 * @param  {[type]} allPixelsInOneChar [某一个字中的像素点]
 * @param  {[type]} allPixelsInPhoto   [图片中的所有像素点]
 */
function visitPixelBeside(pixel, pixelsVisited, allPixelsInOneChar, image) {
  let allPixelsInOneChar = []
  if (isPixelVisit(pixel, pixelsVisited)) {
    return
  }
  let positionString = pixel.x + ',' + pixel.y
  pixelsVisited[positionString] = true

  if (!isPixelBlack(pixel)) {
    return
  }
  allPixelsInOneChar.push(pixel)

  // //→
  // visitPixelRight(pixel, pixelsVisited, allPixelsInOneChar, allPixelsInPhoto)
  //
  // //↘
  // visitPixelRightDown(pixel, pixelsVisited, allPixelsInOneChar, allPixelsInPhoto)
  //
  // //↓
  // visitPixelDown(pixel, pixelsVisited, allPixelsInOneChar, allPixelsInPhoto)
  //
  // //↙
  // visitPixelLeftDown(pixel, pixelsVisited, allPixelsInOneChar, allPixelsInPhoto)

  return allPixelsInOneChar
}

function visitPixelRight(pixel, image) {
  var pixelToVisit = getRigthPixel(pixel, allPixelsInPhoto)
  visitPixelBeside(pixelToVisit, pixelsVisited, allPixelsInOneChar, allPixelsInPhoto)
}

function visitPixelRightDown(pixel, allPixelsInPhoto) {
  var pixelToVisit = getRightDownPixel(pixel, allPixelsInPhoto)
  visitPixelBeside(pixelToVisit, pixelsVisited, allPixelsInOneChar, allPixelsInPhoto)
}

function visitPixelDown(pixel) {
  var pixelToVisit = getDownPixel(pixel, allPixelsInPhoto)
  visitPixelBeside(pixelToVisit, pixelsVisited, allPixelsInOneChar, allPixelsInPhoto)
}

function visitPixelLeftDown(pixel) {
  var pixelToVisit = getLeftDownPixel(pixel, allPixelsInPhoto)
  visitPixelBeside(pixelToVisit, pixelsVisited, allPixelsInOneChar, allPixelsInPhoto)
}


function pasteCharOnNewPhoto(allPixelsInOneChar, newPhoto) {
  // TODO
  // 最后把这个字中的像素点paste到一张新的图里，就把这个字提取出来了
}
