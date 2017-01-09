const Jimp = require('jimp')
const util = require('util')
const imageDir = './test/resource/imagelibrary/imagelibrary/'
let imagePath = imageDir + 'big_ccp_ALL1_nodiff_nzd.png'

Jimp.read(imagePath)
  .then(function (image) {
    let width = image.bitmap.width
    let height = image.bitmap.height

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {

        let pixelColor = image.getPixelColor(x, y)
        console.log(Jimp.intToRGBA(pixelColor))
      }
    }
  })
  .catch(function (err) {
    console.log(util.inspect(err))
  })


// //验证码图片中的所有像素点
// var allPixelsInPhoto = []
//   //存放某一个中文字像素点的数组
// var allPixelsInOneChar = []
//   //存放已访问过的像素点的数组
// var pixelsVisited = []


// for (pixel in allPixelsInPhoto) {
//   visitPixelBeside(pixel)
// }

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
function visitPixelBeside(pixel, pixelsVisited, allPixelsInOneChar, allPixelsInPhoto) {
  if (isPixelInPhoto(pixel, allPixelsInPhoto)) {
    return
  }
  pixelsVisited.push(pixel)
  if (isPixelVisit(pixel, pixelsVisited)) {
    return
  }
  if (isPixelWhite(pixel)) {
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
}

// function visitPixelRight(pixel, allPixelsInPhoto) {
//   var pixelToVisit = getRigthPixel(pixel, allPixelsInPhoto)
//   visitPixelBeside(pixelToVisit, pixelsVisited, allPixelsInOneChar, allPixelsInPhoto)
// }
//
// function visitPixelRightDown(pixel, allPixelsInPhoto) {
//   var pixelToVisit = getRightDownPixel(pixel, allPixelsInPhoto)
//   visitPixelBeside(pixelToVisit, pixelsVisited, allPixelsInOneChar, allPixelsInPhoto)
// }
//
// function visitPixelDown(pixel) {
//   var pixelToVisit = getDownPixel(pixel, allPixelsInPhoto)
//   visitPixelBeside(pixelToVisit, pixelsVisited, allPixelsInOneChar, allPixelsInPhoto)
// }
//
// function visitPixelLeftDown(pixel) {
//   var pixelToVisit = getLeftDownPixel(pixel, allPixelsInPhoto)
//   visitPixelBeside(pixelToVisit, pixelsVisited, allPixelsInOneChar, allPixelsInPhoto)
// }


function pasteCharOnNewPhoto(allPixelsInOneChar, newPhoto) {
  // TODO
  // 最后把这个字中的像素点paste到一张新的图里，就把这个字提取出来了
}
