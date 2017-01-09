'use strict'
const Tesseract = require('tesseract.js')
const fs = require('fs')

let imagePath = './test/resource/358_sm_img_gj.png'
let myImage = fs.readFileSync(imagePath)

Tesseract.recognize(imagePath, {
    lang: 'chi_sim'
  })
  .then(function (result) {
    console.log(result)
  })
