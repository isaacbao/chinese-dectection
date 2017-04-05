'use strict'
const Tesseract = require('tesseract.js')
const fs = require('fs')

let imageDir = './test/output/'


for (let i = 0; i <= 7; i++) {
  let imagePath = imageDir + 'char' + i + '.jpg'
  let myImage = fs.readFileSync(imagePath)
  Tesseract.recognize(imagePath, {
      lang: 'chi_sim'
    })
    .then(function (result) {
      console.log(result)
    })
}
