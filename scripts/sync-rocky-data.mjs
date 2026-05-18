import { copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'csv-parse/sync'

const vibeKeys = [
  'dreamy',
  'chaotic',
  'romantic',
  'bold',
  'brainy',
  'cozy',
  'glam',
  'wild',
]

const themeRules = [
  {
    key: 'cosmic',
    keywords: ['space', 'stargazing', 'nebula', 'aurora', 'eclipse', 'molecule', 'robo'],
    vibes: { dreamy: 4, brainy: 2, bold: 1 },
  },
  {
    key: 'floral',
    keywords: [
      'bloom',
      'blossom',
      'flower',
      'garden',
      'poppies',
      'sunflower',
      'dandelion',
      'daisy',
      'waterlilies',
      'papillon',
    ],
    vibes: { romantic: 4, dreamy: 2, cozy: 1 },
  },
  {
    key: 'artsy',
    keywords: ['van gogh', 'dali', 'guernica', 'monet', 'jean-michael', 'rhapsody', 'cultural', 'qinghua'],
    vibes: { brainy: 4, dreamy: 2, glam: 1 },
  },
  {
    key: 'rebel',
    keywords: ['punk', 'disco', 'electric', 'boogaloo', 'woodstock', 'stoned', 'wave', 'amazing'],
    vibes: { chaotic: 4, glam: 2, bold: 2 },
  },
  {
    key: 'sporty',
    keywords: ['sports', 'construction', 'bulldozer', 'hero', 'super', 'beach', 'chase', 'wave'],
    vibes: { bold: 4, wild: 2, cozy: 1 },
  },
  {
    key: 'heroic',
    keywords: ['pirate', 'trojan', 'bat dog', 'hero', 'super', 'amazing', 'saved by the bark'],
    vibes: { bold: 4, wild: 2, dreamy: 1 },
  },
  {
    key: 'cozy',
    keywords: ['brunch', 'sweetest', 'corn dog', 'cheese', 'lemonade', 'grateful', 'luck', 'love', 'staycation'],
    vibes: { cozy: 4, romantic: 2, dreamy: 1 },
  },
  {
    key: 'spooky',
    keywords: ['phantom', 'eclipse', 'stormy', 'maze', 'lost', 'bat dog', 'bitter sweet'],
    vibes: { dreamy: 2, chaotic: 2, glam: 1, bold: 1 },
  },
  {
    key: 'nature',
    keywords: ['safari', 'wildlife', 'garden', 'cherry', 'sunflower', 'dandelion', 'outdoor', 'bluegill', 'barn', 'beach'],
    vibes: { dreamy: 2, cozy: 2, wild: 2 },
  },
  {
    key: 'abstract',
    keywords: ['doodle', 'kaleidoscope', 'dots', 'pattern', 'stripes', 'rippling', 'tribal', 'maze', 'untitled'],
    vibes: { chaotic: 3, brainy: 2, dreamy: 1 },
  },
  {
    key: 'mythic',
    keywords: ['unicorn', 'hula', 'greek god', 'hermes', 'trojan', 'pirate', 'sunrise'],
    vibes: { dreamy: 2, bold: 2, glam: 1 },
  },
  {
    key: 'patriotic',
    keywords: ['patriotic', 'military', 'service', 'american', 'colonel'],
    vibes: { bold: 2, cozy: 1, brainy: 1 },
  },
  {
    key: 'hometown',
    keywords: ['macomb', 'parts', 'road', 'citizen', 'foundation', 'pack', 'legacy', 'landlord'],
    vibes: { cozy: 2, brainy: 1, bold: 1, romantic: 1 },
  },
]

function repoRootFromScript() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url))
  return path.resolve(scriptDir, '..')
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function canonicalizeName(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/^the\s+/, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function dedupeKeyForRocky(rocky) {
  return [
    canonicalizeName(rocky.name),
    String(rocky.artist).trim().toLowerCase(),
    String(rocky.location).trim().toLowerCase(),
    String(rocky.address).trim().toLowerCase(),
  ].join('|')
}

function mergeRockyComments(...comments) {
  return [...new Set(comments.map((comment) => comment?.trim()).filter(Boolean))].join('; ')
}

function pickPreferredRocky(left, right) {
  if (left.year !== right.year) {
    return left.year > right.year ? left : right
  }

  return left.objectId >= right.objectId ? left : right
}

function dedupeRockys(rockys) {
  const deduped = new Map()

  for (const rocky of rockys) {
    const key = dedupeKeyForRocky(rocky)
    const existing = deduped.get(key)

    if (!existing) {
      deduped.set(key, rocky)
      continue
    }

    const preferred = pickPreferredRocky(existing, rocky)
    const other = preferred === existing ? rocky : existing

    deduped.set(key, {
      ...preferred,
      description: preferred.description || other.description,
      comment: mergeRockyComments(other.comment, preferred.comment),
    })
  }

  return [...deduped.values()]
}

function asBoolean(value) {
  return String(value).trim().toLowerCase() === 'yes'
}

function asNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function blankVibes() {
  return Object.fromEntries(vibeKeys.map((key) => [key, 0]))
}

function addVibes(target, source, weight = 1) {
  for (const key of vibeKeys) {
    target[key] += (source[key] ?? 0) * weight
  }
}

function topEntries(record, limit) {
  return vibeKeys
    .map((key) => [key, record[key]])
    .filter(([, value]) => value > 0)
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([key]) => key)
}

function titleCase(value) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

async function main() {
  const repoRoot = repoRootFromScript()
  const sourceDir = process.env.ROCKY_SOURCE_DIR ?? '/mnt/d8/archive/image/MacombRocky'
  const csvPath = path.join(sourceDir, 'rocky_pois.csv')
  const publicDir = path.join(repoRoot, 'public')
  const imageOutputDir = path.join(publicDir, 'rockys')
  const dataOutputPath = path.join(publicDir, 'rockys-data.json')

  const csvText = await readFile(csvPath, 'utf8')
  const records = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })

  const files = await readdir(sourceDir)
  const imageFiles = files.filter((file) => file.endsWith('.avif'))

  await mkdir(imageOutputDir, { recursive: true })

  const rockys = []

  for (const row of records) {
    const imagePrefix = `${row.OBJECTID}_${row.Id}_`
    const imageFile = imageFiles.find((file) => file.startsWith(imagePrefix))

    if (!imageFile) {
      throw new Error(`Missing image for Rocky OBJECTID=${row.OBJECTID}, Id=${row.Id}`)
    }

    await copyFile(path.join(sourceDir, imageFile), path.join(imageOutputDir, imageFile))

    const combinedText = [
      row.Name,
      row.Description,
      row.Comment,
      row.Location,
      row.Address,
      row.Sponsor,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const vibes = blankVibes()
    const themeHits = []

    for (const rule of themeRules) {
      if (rule.keywords.some((keyword) => combinedText.includes(keyword))) {
        themeHits.push(rule.key)
        addVibes(vibes, rule.vibes)
      }
    }

    if (asBoolean(row.Indoors)) {
      themeHits.push('cozy')
      addVibes(vibes, { cozy: 1, romantic: 1 })
    }

    if (asBoolean(row.Campus)) {
      themeHits.push('campus')
      addVibes(vibes, { brainy: 2, dreamy: 1 })
    }

    if (asBoolean(row.Alpha)) {
      themeHits.push('legacy')
      addVibes(vibes, { bold: 1, brainy: 1 })
    }

    if (themeHits.length === 0) {
      themeHits.push('classic')
      addVibes(vibes, { cozy: 2, bold: 1, brainy: 1 })
    }

    const themes = [...new Set(themeHits)]
    const lat = asNumber(row.Lat)
    const long = asNumber(row.Long)

    rockys.push({
      objectId: Number(row.OBJECTID),
      id: Number(row.Id),
      slug: slugify(`${row.Name}-${row.Id}`),
      name: row.Name,
      location: row.Location,
      address: row.Address,
      city: row.City,
      artist: row.Artist,
      year: Number(row.Year),
      alpha: asBoolean(row.Alpha),
      indoors: asBoolean(row.Indoors),
      campus: asBoolean(row.Campus),
      sponsor: row.Sponsor,
      long,
      lat,
      mapsUrl:
        lat !== null && long !== null
          ? `https://www.google.com/maps/search/?api=1&query=${lat},${long}`
          : '',
      description: row.Description?.trim() || '',
      comment: row.Comment?.trim() || '',
      retired: asBoolean(row.Retired),
      privateResidence: asBoolean(row.PrivateResidence),
      imagePath: `rockys/${imageFile}`,
      relativeImagePath: row.relative_image_path,
      themes,
      primaryTheme: themes[0],
      vibeScores: vibes,
      topVibes: topEntries(vibes, 3),
      venueLabel: titleCase(row.Location || row.Address || 'Unknown'),
    })
  }

  const dedupedRockys = dedupeRockys(rockys)

  dedupedRockys.sort((left, right) => {
    if (left.year !== right.year) {
      return right.year - left.year
    }

    return left.name.localeCompare(right.name)
  })

  await writeFile(dataOutputPath, `${JSON.stringify(dedupedRockys, null, 2)}\n`, 'utf8')

  console.log(`Synced ${dedupedRockys.length} Rockys from ${sourceDir}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
