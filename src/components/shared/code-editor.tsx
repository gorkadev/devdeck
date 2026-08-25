import CodeMirror, { type ReactCodeMirrorProps } from "@uiw/react-codemirror"
import { json } from "@codemirror/lang-json"
import { EditorView } from "@codemirror/view"
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language"
import { tags as t } from "@lezer/highlight"
import { cn } from "@/lib/utils"

// Theme adaptado a los colores neutrales/monocromáticos de DevDeck (shadcn)
const devDeckThemeBase = EditorView.theme({
  "&": {
    backgroundColor: "transparent !important",
    color: "var(--foreground)",
  },
  ".cm-content": {
    caretColor: "var(--foreground)",
  },
  ".cm-cursor, .cm-dropCursor": { 
    borderLeftColor: "var(--foreground)" 
  },
  "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": { 
    backgroundColor: "var(--muted) !important",
  },
  ".cm-panels": { 
    backgroundColor: "var(--background)", 
    color: "var(--foreground)" 
  },
  ".cm-panels.cm-panels-top": { 
    borderBottom: "1px solid var(--border)" 
  },
  ".cm-panels.cm-panels-bottom": { 
    borderTop: "1px solid var(--border)" 
  },
  ".cm-activeLine": { 
    backgroundColor: "var(--muted) !important", 
  },
  ".cm-selectionMatch": { 
    backgroundColor: "var(--accent)" 
  },
  "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
    backgroundColor: "var(--accent)",
    outline: "1px solid var(--border)"
  },
  ".cm-gutters": {
    backgroundColor: "transparent",
    color: "var(--muted-foreground)",
    borderRight: "1px solid var(--border)",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "transparent",
    color: "var(--foreground)"
  },
  ".cm-foldPlaceholder": {
    backgroundColor: "transparent",
    border: "none",
    color: "var(--muted-foreground)"
  },
  ".cm-tooltip": {
    border: "1px solid var(--border)",
    backgroundColor: "var(--popover)",
    color: "var(--popover-foreground)",
  },
  ".cm-tooltip-autocomplete": {
    "& > ul > li[aria-selected]": {
      backgroundColor: "var(--accent)",
      color: "var(--accent-foreground)"
    }
  }
})

// Syntax highlighting minimalista, apoyándose en la tipografía (frontend-design skill)
const devDeckHighlightStyle = HighlightStyle.define([
  { tag: [t.keyword, t.operator, t.punctuation], color: "var(--muted-foreground)" },
  { tag: [t.name, t.deleted, t.character, t.macroName], color: "var(--foreground)" },
  { tag: [t.propertyName], color: "var(--foreground)", fontWeight: "500" }, // Keys en JSON un poco más fuertes
  { tag: [t.function(t.variableName), t.labelName], color: "var(--foreground)" },
  { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: "var(--foreground)" },
  { tag: [t.definition(t.name), t.separator], color: "var(--muted-foreground)" },
  { tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: "var(--foreground)" },
  { tag: [t.url, t.escape, t.regexp, t.link, t.special(t.string)], color: "var(--foreground)" },
  { tag: [t.meta, t.comment], color: "var(--muted-foreground)", fontStyle: "italic" },
  { tag: t.strong, fontWeight: "bold" },
  { tag: t.emphasis, fontStyle: "italic" },
  { tag: t.strikethrough, textDecoration: "line-through" },
  { tag: t.link, color: "var(--muted-foreground)", textDecoration: "underline" },
  { tag: t.heading, fontWeight: "bold", color: "var(--foreground)" },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: "var(--foreground)" },
  { tag: [t.processingInstruction, t.string, t.inserted], color: "var(--muted-foreground)" }, // Valores strings un poco atenuados para contraste
  { tag: t.invalid, color: "var(--destructive)" },
])

const devDeckTheme = [devDeckThemeBase, syntaxHighlighting(devDeckHighlightStyle)]

export interface CodeEditorProps extends Omit<ReactCodeMirrorProps, 'theme'> {
  value: string
  onChange?: (value: string) => void
  readOnly?: boolean
  className?: string
  height?: string
  language?: "json" | "none"
  extensions?: ReactCodeMirrorProps['extensions']
}

export function CodeEditor({
  value,
  onChange,
  readOnly = false,
  className,
  height = "100%",
  language = "json",
  extensions = [],
  ...props
}: CodeEditorProps) {
  const langExtension = language === "json" ? [json()] : []

  return (
    <div
      className={cn(
        "flex flex-col h-full overflow-hidden rounded-xl border bg-card text-card-foreground",
        className
      )}
    >
      <CodeMirror
        value={value}
        height={height}
        extensions={[...langExtension, EditorView.lineWrapping, ...(Array.isArray(extensions) ? extensions : [extensions])]}
        onChange={onChange}
        readOnly={readOnly}
        theme={devDeckTheme}
        className="flex-1 overflow-auto text-sm [&_.cm-editor]:h-full [&_.cm-scroller]:font-mono p-2"
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightActiveLine: !readOnly,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          defaultKeymap: true,
          searchKeymap: true,
          historyKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true,
        }}
        {...props}
      />
    </div>
  )
}
