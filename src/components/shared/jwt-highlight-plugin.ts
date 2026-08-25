import { Decoration, type DecorationSet, ViewPlugin, ViewUpdate, EditorView } from "@codemirror/view"
import { RangeSetBuilder } from "@codemirror/state"

// Clases CSS personalizadas para igualar exactamente a jwt.io
const headerMark = Decoration.mark({ class: "jwt-header text-[#e27133] font-medium" })
const payloadMark = Decoration.mark({ class: "jwt-payload text-[#9472f7] font-medium" })
const signatureMark = Decoration.mark({ class: "jwt-signature text-[#8fc88a] font-medium" })
const dotMark = Decoration.mark({ class: "jwt-dot text-[#ff69e4]" })

function buildDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>()
  
  for (const { from, to } of view.visibleRanges) {
    const text = view.state.doc.sliceString(from, to)
    
    // Un JWT típico es [A-Za-z0-9-_=]+.[A-Za-z0-9-_=]+.[A-Za-z0-9-_=]*
    const offset = from
    let partIndex = 0 // 0: header, 1: payload, 2: signature
    
    let currentPartStart = offset
    
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '.') {
        // Encontramos un punto, terminamos la parte actual
        if (i > (currentPartStart - offset)) {
          const mark = partIndex === 0 ? headerMark : (partIndex === 1 ? payloadMark : signatureMark)
          builder.add(currentPartStart, offset + i, mark)
        }
        
        // Marcamos el punto
        builder.add(offset + i, offset + i + 1, dotMark)
        
        partIndex++
        currentPartStart = offset + i + 1
      }
    }
    
    // Procesamos lo que quede después del último punto
    if (currentPartStart - offset < text.length) {
       const mark = partIndex === 0 ? headerMark : (partIndex === 1 ? payloadMark : signatureMark)
       builder.add(currentPartStart, offset + text.length, mark)
    }
  }
  
  return builder.finish()
}

export const jwtHighlightPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet

    constructor(view: EditorView) {
      this.decorations = buildDecorations(view)
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = buildDecorations(update.view)
      }
    }
  },
  {
    decorations: v => v.decorations
  }
)
