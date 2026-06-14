// Auto-generates the data-table API reference from the @monabbir/tablecn source
// of truth (types.ts / localization.ts / icons.tsx / use-data-table.ts), so the
// docs tables never drift from the real API. Emits a typed module the docs
// pages import. Run from the repo root (anchored via import.meta.url):
//   node apps/web/scripts/build-api-docs.mjs
import { writeFileSync, mkdirSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { Project, SyntaxKind } from "ts-morph"

const REPO = join(dirname(fileURLToPath(import.meta.url)), "../../..")
const DT = join(REPO, "packages/ui/src/components/data-table")
const OUT = join(REPO, "apps/web/lib/api-reference.generated.ts")

const project = new Project({
  skipAddingFilesFromTsConfig: true,
  compilerOptions: { allowJs: false, jsx: 4 },
})

const typesSf = project.addSourceFileAtPath(join(DT, "types.ts"))
const localeSf = project.addSourceFileAtPath(join(DT, "localization.ts"))
const iconsSf = project.addSourceFileAtPath(join(DT, "icons.tsx"))
const hookSf = project.addSourceFileAtPath(join(DT, "use-data-table.ts"))
const tableSf = project.addSourceFileAtPath(join(DT, "data-table.tsx"))

const oneLine = (s) => (s ?? "").replace(/\s+/g, " ").trim()

/** JSDoc summary for an interface property. */
function describe(prop) {
  const docs = prop.getJsDocs()
  if (!docs.length) return ""
  return oneLine(docs.map((d) => d.getDescription()).join(" "))
}

/** Pull `name = defaultText` pairs out of the `const { … } = options` destructure. */
function destructureDefaults(fn) {
  const decl = fn
    .getDescendantsOfKind(SyntaxKind.VariableDeclaration)
    .find((v) => v.getInitializer()?.getText() === "options")
  const map = {}
  if (!decl) return map
  const pattern = decl.getNameNode().asKind(SyntaxKind.ObjectBindingPattern)
  if (!pattern) return map
  for (const el of pattern.getElements()) {
    const key = el.getPropertyNameNode()?.getText() ?? el.getName()
    const init = el.getInitializer()
    if (init) map[key] = oneLine(init.getText())
  }
  return map
}

/** Map an object-literal `const X = { … }` to { key: initializerText }. */
function objectLiteralDefaults(sf, varName) {
  const decl = sf.getVariableDeclarationOrThrow(varName)
  const obj = decl.getInitializerIfKindOrThrow(
    SyntaxKind.ObjectLiteralExpression
  )
  const map = {}
  for (const p of obj.getProperties()) {
    const assign = p.asKind(SyntaxKind.PropertyAssignment)
    if (!assign) continue
    map[assign.getName().replace(/['"]/g, "")] = assign.getInitializer()
  }
  return map
}

/** Build API rows from an interface's own properties. */
function membersOf(iface, { defaults = {}, omit = [] } = {}) {
  return iface
    .getProperties()
    .filter((p) => !omit.includes(p.getName()))
    .map((p) => {
      const name = p.getName()
      return {
        name,
        type: oneLine(p.getTypeNode()?.getText() ?? p.getType().getText()),
        required: !p.hasQuestionToken(),
        default: defaults[name] ?? null,
        description: describe(p),
      }
    })
}

// --- useDataTable options (our own additions; TanStack TableOptions pass through)
const optionDefaults = destructureDefaults(
  hookSf.getFunctionOrThrow("useDataTable")
)
const useDataTableOptions = membersOf(
  typesSf.getInterfaceOrThrow("UseDataTableOptions"),
  { defaults: optionDefaults, omit: ["getCoreRowModel"] }
)

// --- Column options (the ColumnMeta augmentation)
const colMetaModule = typesSf
  .getModules()
  .find((m) => m.getName().includes("@tanstack/react-table"))
const columnOptions = membersOf(
  colMetaModule.getInterfaceOrThrow("ColumnMeta")
)

// --- Table instance API (table.cnTable = DataTableConfig)
const tableInstance = membersOf(typesSf.getInterfaceOrThrow("DataTableConfig"))

// --- <DataTable /> component props
const dataTableProps = membersOf(
  tableSf.getInterfaceOrThrow("DataTableProps"),
  { defaults: {} }
)

// --- Localization keys (+ default English values)
const localeDefaults = objectLiteralDefaults(localeSf, "defaultLocalization")
const localizationKeys = localeSf
  .getInterfaceOrThrow("DataTableLocalization")
  .getProperties()
  .map((p) => {
    const init = localeDefaults[p.getName()]
    const typeText = oneLine(p.getTypeNode()?.getText() ?? "")
    const isFn = typeText.includes("=>")
    return {
      name: p.getName(),
      type: typeText,
      required: !p.hasQuestionToken(),
      default: init
        ? isFn
          ? oneLine(init.getText())
          : init.getText().replace(/^["'`]|["'`]$/g, "")
        : null,
      description: describe(p),
    }
  })

// --- Icon slots (+ default Remix component)
const iconDefaults = objectLiteralDefaults(iconsSf, "defaultIcons")
const iconSlots = iconsSf
  .getInterfaceOrThrow("DataTableIcons")
  .getProperties()
  .map((p) => ({
    name: p.getName(),
    type: "IconComponent",
    required: true,
    default: iconDefaults[p.getName()]?.getText() ?? null,
    description: describe(p),
  }))

const banner =
  "// AUTO-GENERATED by apps/web/scripts/build-api-docs.mjs — do not edit by hand.\n" +
  "// Regenerate with `pnpm --filter tablecn-web api:build`.\n\n"

const body =
  `export interface ApiMember {\n` +
  `  name: string\n` +
  `  type: string\n` +
  `  required: boolean\n` +
  `  default: string | null\n` +
  `  description: string\n` +
  `}\n\n` +
  [
    ["useDataTableOptions", useDataTableOptions],
    ["columnOptions", columnOptions],
    ["tableInstance", tableInstance],
    ["dataTableProps", dataTableProps],
    ["localizationKeys", localizationKeys],
    ["iconSlots", iconSlots],
  ]
    .map(
      ([name, rows]) =>
        `export const ${name}: ApiMember[] = ${JSON.stringify(rows, null, 2)}\n`
    )
    .join("\n")

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, banner + body)

console.log(
  `api reference built → apps/web/lib/api-reference.generated.ts ` +
    `(options ${useDataTableOptions.length}, column ${columnOptions.length}, ` +
    `instance ${tableInstance.length}, props ${dataTableProps.length}, ` +
    `localization ${localizationKeys.length}, icons ${iconSlots.length})`
)
