// Keel tokens plugin runtime. scripts/figma-plugin.mjs prepends `const DATA = {...}`
// (built from src/tokens) and writes the result to figma/plugin/code.js.
// Two actions:
//   push    create or update every Keel variable and style from DATA (safe to repeat)
//   export  read the file's Keel variables and styles as JSON, for `npm run figma:diff`

/* global DATA */
const hex = (h) => ({ r: parseInt(h.slice(1, 3), 16) / 255, g: parseInt(h.slice(3, 5), 16) / 255, b: parseInt(h.slice(5, 7), 16) / 255 })
const toHex = (c) => '#' + [c.r, c.g, c.b].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('').toUpperCase()
const toHexA = (c) => toHex(c) + Math.round(c.a * 255).toString(16).padStart(2, '0').toUpperCase()

async function push() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync()
  const all = await figma.variables.getLocalVariablesAsync()
  const report = { created: 0, updated: 0, styles: 0 }

  function collection(name, modes) {
    let c = collections.find((x) => x.name === name)
    if (!c) {
      c = figma.variables.createVariableCollection(name)
      c.renameMode(c.modes[0].modeId, modes[0])
      for (const m of modes.slice(1)) c.addMode(m)
      collections.push(c)
    }
    return c
  }
  function variable(c, name, type) {
    let v = all.find((x) => x.variableCollectionId === c.id && x.name === name)
    if (v) report.updated++
    else {
      v = figma.variables.createVariable(name, c, type)
      all.push(v)
      report.created++
    }
    return v
  }
  const byName = (c, name) => {
    const v = all.find((x) => x.variableCollectionId === c.id && x.name === name)
    if (!v) throw new Error('Missing variable ' + name)
    return v
  }

  // Raw-value collections (one mode each)
  for (const coll of DATA.raw) {
    const c = collection(coll.name, ['Value'])
    for (const t of coll.variables) {
      const v = variable(c, t.name, t.type)
      v.setValueForMode(c.modes[0].modeId, t.type === 'COLOR' ? hex(t.value) : t.value)
      v.scopes = t.scopes
      v.description = t.description || ''
      if (t.web) v.setVariableCodeSyntax('WEB', t.web)
    }
  }

  // Semantic colors: aliases to Primitives, one value per mode
  const prim = collection('Primitives', ['Value'])
  const color = collection('Color', DATA.color.modes)
  for (const t of DATA.color.variables) {
    const v = variable(color, t.name, 'COLOR')
    for (const m of color.modes) v.setValueForMode(m.modeId, figma.variables.createVariableAlias(byName(prim, t.values[m.name])))
    v.scopes = t.scopes
    v.description = t.description
    v.setVariableCodeSyntax('WEB', t.web)
  }

  // Text styles bound to Type variables
  const type = collection('Type', ['Value'])
  const textStyles = await figma.getLocalTextStylesAsync()
  for (const s of DATA.textStyles) {
    await figma.loadFontAsync({ family: s.family, style: s.style })
    let st = textStyles.find((x) => x.name === s.name)
    if (!st) {
      st = figma.createTextStyle()
      st.name = s.name
    }
    st.fontName = { family: s.family, style: s.style }
    st.fontSize = s.size
    st.lineHeight = { value: s.lineHeight, unit: 'PIXELS' }
    st.letterSpacing = { value: s.letterSpacing, unit: 'PERCENT' }
    st.textCase = s.upper ? 'UPPER' : 'ORIGINAL'
    for (const [field, varName] of Object.entries(s.bindings)) st.setBoundVariable(field, byName(type, varName))
    st.description = s.description
    report.styles++
  }

  // Shadows as effect styles
  const effectStyles = await figma.getLocalEffectStylesAsync()
  for (const s of DATA.effectStyles) {
    let st = effectStyles.find((x) => x.name === s.name)
    if (!st) {
      st = figma.createEffectStyle()
      st.name = s.name
    }
    st.effects = s.layers.map((l) => {
      const c = hex(l.color)
      return { type: 'DROP_SHADOW', color: { r: c.r, g: c.g, b: c.b, a: parseInt(l.color.slice(7, 9), 16) / 255 }, offset: { x: l.x, y: l.y }, radius: l.blur, spread: l.spread, visible: true, blendMode: 'NORMAL' }
    })
    st.description = s.description
    report.styles++
  }
  return report
}

async function exportJson() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync()
  const all = await figma.variables.getLocalVariablesAsync()
  const names = Object.fromEntries(all.map((v) => [v.id, v.name]))
  const out = { variables: {}, textStyles: {}, effectStyles: {} }
  for (const v of all) {
    const c = collections.find((x) => x.id === v.variableCollectionId)
    const modes = {}
    for (const m of c.modes) {
      const val = v.valuesByMode[m.modeId]
      modes[m.name] = val && val.type === 'VARIABLE_ALIAS' ? '{' + names[val.id] + '}' : v.resolvedType === 'COLOR' ? toHex(val) : val
    }
    out.variables[c.name + '/' + v.name] = { modes, scopes: [...v.scopes].sort(), web: v.codeSyntax.WEB || '' }
  }
  for (const s of await figma.getLocalTextStylesAsync()) {
    const b = {}
    for (const [k, ref] of Object.entries(s.boundVariables || {})) b[k] = names[ref.id]
    out.textStyles[s.name] = { family: s.fontName.family, style: s.fontName.style, size: s.fontSize, lineHeight: s.lineHeight.value, letterSpacing: s.letterSpacing.value, upper: s.textCase === 'UPPER', bindings: b }
  }
  for (const s of await figma.getLocalEffectStylesAsync()) {
    out.effectStyles[s.name] = s.effects.map((e) => ({ color: toHexA(e.color), x: e.offset.x, y: e.offset.y, blur: e.radius, spread: e.spread }))
  }
  return out
}

figma.showUI(__html__, { width: 380, height: 460, themeColors: true })
figma.ui.onmessage = async (msg) => {
  try {
    if (msg.type === 'push') figma.ui.postMessage({ type: 'pushed', report: await push() })
    if (msg.type === 'export') figma.ui.postMessage({ type: 'exported', json: JSON.stringify(await exportJson(), null, 2) })
    if (msg.type === 'close') figma.closePlugin()
  } catch (e) {
    figma.ui.postMessage({ type: 'error', message: String(e && e.message ? e.message : e) })
  }
}
