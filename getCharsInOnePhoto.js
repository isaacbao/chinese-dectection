const Jimp = require('jimp')
const util = require('util')
  // const Math = require('Math')

const imageDir = './test/resource/imagelibrary/imagelibrary/'
const JIMP_RED = Jimp.rgbaToInt(255, 0, 0, 255)

let imagePath = imageDir + 'big_ccp_ALL1_nodiff_nzd.png'

//存放多组像素，每组像素都组成一个汉字
let allColorLump = []

//存放已访问过的像素点的数组
let pixelsVisited = {}

let main = function () {
  Jimp.read(imagePath)
    .then(function (image) {
      let width = image.bitmap.width
      let height = image.bitmap.height
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let pixel = getPixelFromImage(x, y, image)
          let pixelsInColorLump = []
          pixelsInColorLump = visitPixelBeside(pixel, pixelsVisited, pixelsInColorLump, image)
          if (pixelsInColorLump && pixelsInColorLump.length > 0) {
            let position = getColorLumpPosition(pixelsInColorLump)
            let colorLump = {
              position: position,
              pixels: pixelsInColorLump
            }
            let radius = getColorLumpRadius(colorLump)
            colorLump.radius = radius

            allColorLump.push(colorLump)
          }
        }
      }
      console.log(allColorLump.length)
      for (let i = 0; i < allColorLump.length; i++) {
        let colorLump = allColorLump[i]
        pasteCharOnNewImage(colorLump, './test/output/lump' + i + '.jpg')
      }

      for (let i = 0; i < allColorLump.length; i++) {
        let colorLump = allColorLump[i]
        console.log('current:' + i + '\nposition:' + util.inspect(colorLump.position) + '\nradius:' + colorLump.radius + '\n')
        if (isNormalCharRadius(colorLump.radius)) {
          let minDistance = 999
          let minJ
          for (let j = i + 1; j < allColorLump.length; j++) {
            if (j === i) {
              continue
            }
            let distance = getDistance(allColorLump[j].position, colorLump.position)
            if (distance < minDistance) {
              minDistance = distance
              minJ = j
            }
          }
          console.log('minDistance of ' + minJ + ' and ' + i + ':' + minDistance)
          if (minDistance < 30) {
            let lumpToCombine = allColorLump[i]
            let lumpToAttach = allColorLump[minJ]
            console.log('combine with:' + minJ + '\nposition:' + util.inspect(lumpToAttach.position) + 'radius ' + lumpToAttach.radius + '\n')
            console.log('before combine:\nposition:' + util.inspect(lumpToCombine.position) + 'radius ' + lumpToCombine.radius + '\n')
            combineColorLump(lumpToCombine, lumpToAttach)
            allColorLump.splice(minJ, 1)
            i--
            console.log('after combine:\nposition:' + util.inspect(lumpToCombine.position) + 'radius ' + lumpToCombine.radius + '\n')
          }
        }
        console.log('allColorLump.length' + allColorLump.length)
      }

      for (let i = 0; i < allColorLump.length; i++) {
        let colorLump = allColorLump[i]
        pasteCharOnNewImage(colorLump, './test/output/testImage' + i + '.jpg')
      }
    })
    .catch(function (err) {
      console.log(util.inspect(err))
    })
}

let combineColorLump = function (lump1, lump2) {
  // console.log('lump1.pixels.length:' + lump1.pixels.length)
  // console.log('lump2.pixels.length:' + lump2.pixels.length)
  lump1.pixels = lump1.pixels.concat(lump2.pixels)
    // console.log('lump1.pixels.length after:' + lump1.pixels.length)
  lump1.position = getColorLumpPosition(lump1.pixels)
  lump1.radius = getColorLumpRadius(lump1)
    // console.log('lump combined' + util.inspect(lump1))
  return lump1
}

/**
 * 判断一个半径是不是一个汉字的平均半径
 */
let isNormalCharRadius = function (radius) {
  return (15 < radius || radius < 17)
}

let getColorLumpPosition = function (pixelsInColorLump) {
  let sumX = 0
  let sumY = 0
  let pointAmount = pixelsInColorLump.length
    // console.log('pointAmount:' + pointAmount)
  for (let i = 0; i < pointAmount; i++) {
    let pixel = pixelsInColorLump[i]
    sumX += pixel.x
    sumY += pixel.y
  }

  let aveX = sumX / pointAmount
  let aveY = sumY / pointAmount

  let position = {
    x: parseInt(aveX, 10),
    y: parseInt(aveY, 10)
  }

  // console.log('position:' + util.inspect(position))

  return position

}

/**
 * 找出一个圆，可以刚好把色块中的所有像素点圈在里面，返回这个圆的半径
 * @param  {ColorLump} colorLump [色块]
 * @return {Int}           [圆的半径]
 */
let getColorLumpRadius = function (colorLump) {
  let center = colorLump.position
  let pixels = colorLump.pixels
  let pointAmount = pixels.length
  let maxDistance = 0
  for (let i = 0; i < pointAmount; i++) {
    let pixel = pixels[i]
    let distance = getDistance(pixel, center)
    if (distance > maxDistance) {
      maxDistance = distance
    }
  }
  let radius = maxDistance
  return radius
}

let getDistance = function (position1, position2) {
  return Math.sqrt(Math.pow((position1.x - position2.x), 2) + Math.pow((position1.y - position2.y), 2))
}

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
 * 油漆桶算法提取色块
 * 判断一个像素点是否是黑色像素，如果是黑色像素，则把这个像素点加到allpixelsInColorLump
 * 同时通过递归遍历该像素点周围8个方向的像素点是否是黑色像素，从而把某一个色块中的像素点全部提取出来
 * @param  {[type]} pixel              [要判断的像素点]
 * @param  {[type]} pixelsVisited      [已访问的像素点]
 * @param  {[type]} allpixelsInColorLump [某一个字中的像素点]
 * @param  {[type]} allPixelsInPhoto   [图片中的所有像素点]
 */
let visitPixelBeside = function (pixel, pixelsVisited, allpixelsInColorLump, image) {
  // 已经遍历过的像素点就不管了
  if (isPixelVisit(pixel, pixelsVisited)) {
    return
  }
  // 把该像素点标记为已遍历
  let positionString = pixel.x + ',' + pixel.y
  pixelsVisited[positionString] = true

  if (!isBlack(pixel)) {
    return
  }
  allpixelsInColorLump.push(pixel)

  // ↑
  visitPixelUp(pixel, pixelsVisited, allpixelsInColorLump, image)

  // ↗
  visitPixelUpRight(pixel, pixelsVisited, allpixelsInColorLump, image)

  // →
  visitPixelRight(pixel, pixelsVisited, allpixelsInColorLump, image)

  //↘
  visitPixelRightDown(pixel, pixelsVisited, allpixelsInColorLump, image)

  // ↓
  visitPixelDown(pixel, pixelsVisited, allpixelsInColorLump, image)

  // ↙
  visitPixelLeftDown(pixel, pixelsVisited, allpixelsInColorLump, image)

  // ←
  visitPixelLeft(pixel, pixelsVisited, allpixelsInColorLump, image)

  // ↖
  visitPixelLeftUp(pixel, pixelsVisited, allpixelsInColorLump, image)

  // console.log(allpixelsInColorLump)
  return allpixelsInColorLump
}

let visitPixelUp = function (pixel, pixelsVisited, allpixelsInColorLump, image) {
  let pixelToVisit = getUpPixel(pixel, image)
  visitPixelBeside(pixelToVisit, pixelsVisited, allpixelsInColorLump, image)
}

let getUpPixel = function (pixel, image) {
  let x = pixel.x
  let y = pixel.y - 1
  return getPixelFromImage(x, y, image)
}

let visitPixelUpRight = function (pixel, pixelsVisited, allpixelsInColorLump, image) {
  let pixelToVisit = getUpRigthPixel(pixel, image)
  visitPixelBeside(pixelToVisit, pixelsVisited, allpixelsInColorLump, image)
}

let getUpRigthPixel = function (pixel, image) {
  let x = pixel.x + 1
  let y = pixel.y - 1
  return getPixelFromImage(x, y, image)
}

let visitPixelRight = function (pixel, pixelsVisited, allpixelsInColorLump, image) {
  let pixelToVisit = getRigthPixel(pixel, image)
  visitPixelBeside(pixelToVisit, pixelsVisited, allpixelsInColorLump, image)
}

let getRigthPixel = function (pixel, image) {
  let x = pixel.x + 1
  let y = pixel.y
  return getPixelFromImage(x, y, image)
}

let visitPixelRightDown = function (pixel, pixelsVisited, allpixelsInColorLump, image) {
  let pixelToVisit = getRightDownPixel(pixel, image)
  visitPixelBeside(pixelToVisit, pixelsVisited, allpixelsInColorLump, image)
}

let getRightDownPixel = function (pixel, image) {
  let x = pixel.x + 1
  let y = pixel.y + 1
  return getPixelFromImage(x, y, image)
}

let visitPixelDown = function (pixel, pixelsVisited, allpixelsInColorLump, image) {
  var pixelToVisit = getDownPixel(pixel, image)
  visitPixelBeside(pixelToVisit, pixelsVisited, allpixelsInColorLump, image)
}

let getDownPixel = function (pixel, image) {
  let x = pixel.x
  let y = pixel.y + 1
  return getPixelFromImage(x, y, image)
}

let visitPixelLeftDown = function (pixel, pixelsVisited, allpixelsInColorLump, image) {
  var pixelToVisit = getLeftDownPixel(pixel, image)
  visitPixelBeside(pixelToVisit, pixelsVisited, allpixelsInColorLump, image)
}

let getLeftDownPixel = function (pixel, image) {
  let x = pixel.x - 1
  let y = pixel.y + 1
  return getPixelFromImage(x, y, image)
}

let visitPixelLeft = function (pixel, pixelsVisited, allpixelsInColorLump, image) {
  var pixelToVisit = getLeftPixel(pixel, image)
  visitPixelBeside(pixelToVisit, pixelsVisited, allpixelsInColorLump, image)
}

let getLeftPixel = function (pixel, image) {
  let x = pixel.x - 1
  let y = pixel.y
  return getPixelFromImage(x, y, image)
}

let visitPixelLeftUp = function (pixel, pixelsVisited, allpixelsInColorLump, image) {
  var pixelToVisit = getLeftUpPixel(pixel, image)
  visitPixelBeside(pixelToVisit, pixelsVisited, allpixelsInColorLump, image)
}

let getLeftUpPixel = function (pixel, image) {
  let x = pixel.x - 1
  let y = pixel.y - 1
  return getPixelFromImage(x, y, image)
}

// 最后把这个字中的像素点paste到一张新的图里，就把这个字提取出来了
function pasteCharOnNewImage(colorLump, newImagePath) {
  let image = new Jimp(280, 127, 0xFFFFFFFF, function (err, image) {})
  let allpixelsInColorLump = colorLump.pixels

  for (let i = 0; i < allpixelsInColorLump.length; i++) {
    let pixel = allpixelsInColorLump[i]
    let colorRGBA = pixel.color
      // console.log('pixel:' + util.inspect(pixel))
    let colorHex = Jimp.rgbaToInt(colorRGBA.r, colorRGBA.g, colorRGBA.b, colorRGBA.a)
    image.setPixelColor(colorHex, pixel.x, pixel.y)
  }
  image.setPixelColor(JIMP_RED, colorLump.position.x, colorLump.position.y)
  image.write(newImagePath)

}

/**
 * 让汉字在-30°~30°之间等角度间隔旋转（比如旋转-30°，-25°，-20°，-15°……25°，30°）
 * @param  {ColorLump} colorLump [汉字色块]
 * @param  {int} step  [旋转角度的间隔，比如在上面的例子中step就是5]
 * @return {[type]}       [description]
 */
let rotateImage30Degree = function (colorLump, step) {

}

/**
 * 旋转汉字 归一化
 * @param  {ColorLump} colorLump [汉字色块]
 * @return {[type]}       [旋转后的汉字]
 */
let normalization = function (colorLump) {
  let maxRedius = charImage.redius
  let position = charImage.position
  let top = position.y + maxRedius
  let bottom = position.y + maxRedius
  let pixels = charImage.pixels
  let pixelsInHorizons = []
  for (let horizon = top; horizon >= bottom; horizon--) {
    let pixelsInHorizon = 0
    for (let i = 0; i < pixels.length; i++) {
      let pixel = pixels[i]
      let pixelPosition = pixel.position
      if (pixelPosition.y === horizon) {
        pixelsInHorizon++
      }
    }
    pixelsInHorizons.push(pixelsInHorizon)
  }
  let sumAbs = 0
  for (let i = 1; i < pixelsInHorizons.length; i++) {
    let abs = Math.abs(pixelsInHorizons[i], pixelsInHorizons[i - 1])
    sumAbs += abs
  }
}
