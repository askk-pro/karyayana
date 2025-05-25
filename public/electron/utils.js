const fs = require("fs")
const path = require("path")

function createSoundsDirectory() {
  const soundsPath = path.join(__dirname, "../sounds")

  if (!fs.existsSync(soundsPath)) {
    fs.mkdirSync(soundsPath, { recursive: true })
    console.log("Created sounds folder at:", soundsPath)
  }

  return soundsPath
}

module.exports = {
  createSoundsDirectory,
}
