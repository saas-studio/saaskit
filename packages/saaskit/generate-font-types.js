const fonts = require('./fonts.json')
const { find } = require('lodash')
const jsonfile = require('jsonfile')
const fs = require('fs')

let fontFamilies = {}

// for (family of fonts.familyMetadataList) {
//     fontFamilies[family.family] = family
// }

families = ''

for (family of fonts.familyMetadataList) {
    // console.log(family.family)

    families = `${families} | \n'${family.family}'`

    // fontFamilies[family.family] = family
    // for (font of family.fonts) {
    //     fontFamilies[family.family][font]
    // }
}

console.log(families)

fs.writeFileSync('./fonts.txt', families)

// let fontFamilies = fonts.familyMetadataList.map(family => [family.family]: Object.keys(family.fonts))



// jsonfile.writeFileSync('font-temp.json', fontFamilies, { spaces: 2, EOL: '\r\n' })