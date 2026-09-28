const fs = require('fs')
const path = require('path')

function convertFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')

  // Convert lucide-react to lucide-react-native
  content = content.replace(
    /from "lucide-react"/g,
    'from "lucide-react-native"'
  )
  content = content.replace(
    /from 'lucide-react'/g,
    'from "lucide-react-native"'
  )

  // Replace HTML tags with React Native components
  // We'll need to import them
  let rnImports = new Set()

  const tagMap = {
    div: 'View',
    span: 'Text',
    p: 'Text',
    h1: 'Text',
    h2: 'Text',
    h3: 'Text',
    h4: 'Text',
    button: 'Pressable',
    input: 'TextInput',
    textarea: 'TextInput',
    svg: 'View' // SVG is tricky, but let's just use View for now or keep it if it's not used
  }

  for (const [html, rn] of Object.entries(tagMap)) {
    const openRegex = new RegExp(`<${html}(\\s|>)`, 'g')
    const closeRegex = new RegExp(`</${html}>`, 'g')

    if (openRegex.test(content) || closeRegex.test(content)) {
      rnImports.add(rn)
      content = content.replace(openRegex, `<${rn}$1`)
      content = content.replace(closeRegex, `</${rn}>`)
    }
  }

  // Replace onClick with onPress
  content = content.replace(/onClick=/g, 'onPress=')
  // Replace onChange={(e) => setVal(e.target.value)} with onChangeText={setVal}
  // This is a bit tricky, let's do a simple replace for onChange
  // We'll just replace onChange={ with onChangeText={ for inputs, but it might need manual fixing
  content = content.replace(
    /onChange=\{\(e\) => ([a-zA-Z0-9_]+)\(e\.target\.value\)\}/g,
    'onChangeText={$1}'
  )

  // Add React Native imports
  if (rnImports.size > 0) {
    const importStr = `import { ${Array.from(rnImports).join(', ')} } from 'react-native';\n`
    content = importStr + content
  }

  fs.writeFileSync(filePath, content)
}

function walk(dir) {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const fullPath = path.join(dir, file)
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath)
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      convertFile(fullPath)
    }
  }
}

walk('src/features')
