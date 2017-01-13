const Jimp = require('jimp')
const util = require('util')

const imageDir = './test/resource/imagelibrary/imagelibrary/'
let imagePath = imageDir + 'big_ccp_ALL1_nodiff_nzd.png'

//存放多组像素，每组像素都组成一个汉字
let allCharsPixel = []

//存放已访问过的像素点的数组
let pixelsVisited = {}

Jimp.read(imagePath)
  .then(function (image) {
    let width = image.bitmap.width
    let height = image.bitmap.height
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let pixel = getPixelFromImage(x, y, image)
        let pixelsInOneChar = []
        pixelsInOneChar = visitPixelBeside(pixel, pixelsVisited, pixelsInOneChar, image)
        if (pixelsInOneChar && pixelsInOneChar.length > 0) {
          allCharsPixel.push(pixelsInOneChar)
        }
      }
    }
    console.log(allCharsPixel.length)
    pasteCharOnNewImage(allCharsPixel[0], './test/output/testImage.jpg')
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

let getPixelFromImage = function (x, y, image) {
  if (!image.getPixelColor) {
    console.log(util.inspect(image))
  }
  let color = image.getPixelColor(x, y)
  let resultPixel = {
    x: x,
    y: y,
    color: Jimp.intToRGBA(color)
  }
  return resultPixel
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
let visitPixelBeside = function (pixel, pixelsVisited, allPixelsInOneChar, image) {
  // let allPixelsInOneChar = []
  if (isPixelVisit(pixel, pixelsVisited)) {
    return
  }
  let positionString = pixel.x + ',' + pixel.y
  pixelsVisited[positionString] = true

  if (!isBlack(pixel)) {
    return
  }
  allPixelsInOneChar.push(pixel)

  //→
  visitPixelRight(pixel, pixelsVisited, allPixelsInOneChar, image)

  //↘
  visitPixelRightDown(pixel, pixelsVisited, allPixelsInOneChar, image)

  //↓
  visitPixelDown(pixel, pixelsVisited, allPixelsInOneChar, image)

  //↙
  visitPixelLeftDown(pixel, pixelsVisited, allPixelsInOneChar, image)

  console.log(allPixelsInOneChar)
  return allPixelsInOneChar
}

let visitPixelRight = function (pixel, pixelsVisited, allPixelsInOneChar, image) {
  let pixelToVisit = getRigthPixel(pixel, image)
  visitPixelBeside(pixelToVisit, pixelsVisited, allPixelsInOneChar, image)
}

let getRigthPixel = function (pixel, image) {
  let x = pixel.x + 1
  let y = pixel.y
  return getPixelFromImage(x, y, image)
}

let visitPixelRightDown = function (pixel, pixelsVisited, allPixelsInOneChar, image) {
  let pixelToVisit = getRightDownPixel(pixel, image)
  visitPixelBeside(pixelToVisit, pixelsVisited, allPixelsInOneChar, image)
}

let getRightDownPixel = function (pixel, image) {
  let x = pixel.x + 1
  let y = pixel.y + 1
  return getPixelFromImage(x, y, image)
}

let visitPixelDown = function (pixel, pixelsVisited, allPixelsInOneChar, image) {
  var pixelToVisit = getDownPixel(pixel, image)
  visitPixelBeside(pixelToVisit, pixelsVisited, allPixelsInOneChar, image)
}

let getDownPixel = function (pixel, image) {
  let x = pixel.x
  let y = pixel.y + 1
  return getPixelFromImage(x, y, image)
}

let visitPixelLeftDown = function (pixel, pixelsVisited, allPixelsInOneChar, image) {
  var pixelToVisit = getLeftDownPixel(pixel, image)
  visitPixelBeside(pixelToVisit, pixelsVisited, allPixelsInOneChar, image)
}

let getLeftDownPixel = function (pixel, image) {
  let x = pixel.x - 1
  let y = pixel.y + 1
  return getPixelFromImage(x, y, image)
}

// 最后把这个字中的像素点paste到一张新的图里，就把这个字提取出来了
function pasteCharOnNewImage(allPixelsInOneChar, newImagePath) {
  let image = new Jimp(256, 256, function (err, image) {})

  for (let i = 0; i < allPixelsInOneChar.length; i++) {
    let pixel = allPixelsInOneChar[i]
    let colorRGBA = pixel.color
    let colorHex = Jimp.rgbaToInt(colorRGBA.r, colorRGBA.g, colorRGBA.b, colorRGBA.a)
    image.setPixelColor(colorHex, pixel.x, pixel.y)
  }
  image.write(newImagePath)

}
