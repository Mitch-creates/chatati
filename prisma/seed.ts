import { PrismaClient, Gender, Availability, Interest } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // 1. Create Countries
  const germany = await prisma.country.upsert({
    where: { code: 'DE' },
    update: {},
    create: {
      code: 'DE',
      name: 'Germany',
    },
  })

  // 2. Create Cities
  const hamburg = await prisma.city.upsert({
    where: { 
      name_countryId: {
        name: 'Hamburg',
        countryId: germany.id
      }
    },
    update: {},
    create: {
      name: 'Hamburg',
      countryId: germany.id,
    },
  })

  // 3. Create Areas (Districts)
  const areaNames = [
    'Altona',
    'Bergedorf',
    'Eimsbüttel',
    'Harburg',
    'Mitte',
    'Nord',
    'Wandsbek',
  ]

  const areas = []
  for (const name of areaNames) {
    const area = await prisma.area.upsert({
      where: {
        name_cityId: {
          name,
          cityId: hamburg.id
        }
      },
      update: {},
      create: {
        name,
        cityId: hamburg.id,
      },
    })
    areas.push(area)
  }

  // 4. Create Languages
  const languages = [
    { code: 'de', name: 'German' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'it', name: 'Italian' },
    { code: 'tr', name: 'Turkish' },
    { code: 'pl', name: 'Polish' },
    { code: 'ru', name: 'Russian' },
    { code: 'ar', name: 'Arabic' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'nl', name: 'Dutch' },
    { code: 'sv', name: 'Swedish' },
    { code: 'no', name: 'Norwegian' },
    { code: 'da', name: 'Danish' },
    { code: 'fi', name: 'Finnish' },
    { code: 'el', name: 'Greek' },
    { code: 'he', name: 'Hebrew' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ko', name: 'Korean' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'th', name: 'Thai' },
    { code: 'id', name: 'Indonesian' },
    { code: 'fa', name: 'Persian' },
    { code: 'uk', name: 'Ukrainian' },
    { code: 'ro', name: 'Romanian' },
    { code: 'hu', name: 'Hungarian' },
    { code: 'cs', name: 'Czech' },
    { code: 'sk', name: 'Slovak' },
    { code: 'bg', name: 'Bulgarian' },
    { code: 'hr', name: 'Croatian' },
    { code: 'sr', name: 'Serbian' },
    { code: 'sq', name: 'Albanian' },
    { code: 'ca', name: 'Catalan' },
    { code: 'ms', name: 'Malay' },
    { code: 'bn', name: 'Bengali' },
    { code: 'pa', name: 'Punjabi' },
    { code: 'te', name: 'Telugu' },
    { code: 'mr', name: 'Marathi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'ur', name: 'Urdu' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'sw', name: 'Swahili' },
    { code: 'am', name: 'Amharic' },
    { code: 'yo', name: 'Yoruba' },
    { code: 'ig', name: 'Igbo' },
    { code: 'ha', name: 'Hausa' },
    { code: 'az', name: 'Azerbaijani' },
    { code: 'ka', name: 'Georgian' },
    { code: 'hy', name: 'Armenian' },
    { code: 'uz', name: 'Uzbek' },
    { code: 'kk', name: 'Kazakh' },
    { code: 'km', name: 'Khmer' },
    { code: 'lo', name: 'Lao' },
    { code: 'my', name: 'Burmese' },
    { code: 'ne', name: 'Nepali' },
    { code: 'si', name: 'Sinhala' },
    { code: 'af', name: 'Afrikaans' },
    { code: 'et', name: 'Estonian' },
    { code: 'lv', name: 'Latvian' },
    { code: 'lt', name: 'Lithuanian' },
    { code: 'is', name: 'Icelandic' },
    { code: 'ga', name: 'Irish' },
    { code: 'cy', name: 'Welsh' },
    { code: 'eu', name: 'Basque' },
    { code: 'gl', name: 'Galician' },
    { code: 'mt', name: 'Maltese' },
    { code: 'be', name: 'Belarusian' },
    { code: 'mk', name: 'Macedonian' },
    { code: 'sl', name: 'Slovenian' },
    { code: 'bs', name: 'Bosnian' },
    { code: 'mn', name: 'Mongolian' },
    { code: 'tg', name: 'Tajik' },
    { code: 'ky', name: 'Kyrgyz' },
    { code: 'ps', name: 'Pashto' },
    { code: 'ku', name: 'Kurdish' },
    { code: 'so', name: 'Somali' },
    { code: 'zu', name: 'Zulu' },
    { code: 'xh', name: 'Xhosa' },
    { code: 'st', name: 'Sesotho' },
    { code: 'tn', name: 'Tswana' },
    { code: 'ts', name: 'Tsonga' },
    { code: 'ss', name: 'Swati' },
    { code: 've', name: 'Venda' },
    { code: 'nr', name: 'Southern Ndebele' },
    { code: 'rw', name: 'Kinyarwanda' },
    { code: 'ny', name: 'Chichewa' },
    { code: 'mg', name: 'Malagasy' },
    { code: 'sn', name: 'Shona' },
    { code: 'kmr', name: 'Kurdish (Kurmanji)' },
    { code: 'ckb', name: 'Kurdish (Sorani)' },
    { code: 'prs', name: 'Dari' },
    { code: 'fil', name: 'Filipino' },
    { code: 'tl', name: 'Tagalog' },
    { code: 'ht', name: 'Haitian Creole' },
  ]

  const createdLangs = []
  for (const lang of languages) {
    const createdLang = await prisma.language.upsert({
      where: { code: lang.code },
      update: {},
      create: lang,
    })
    createdLangs.push(createdLang)
  }

  // 5. Create 4 Users with Profiles
  const baseEmail = 'michielvandevyver67'
  const domain = 'gmail.com'

  for (let i = 1; i <= 4; i++) {
    const email = `${baseEmail}+${i}@${domain}`
    const name = `Test User ${i}`
    
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name,
        firstName: `Test`,
        lastName: `User ${i}`,
        emailVerified: true,
        profile: {
          create: {
            gender: i % 2 === 0 ? Gender.FEMALE : Gender.MALE,
            bio: `Hello, I am test user ${i}. I love learning new languages and meeting people from different cultures!`,
            timezone: 'Europe/Berlin',
            availability: [Availability.EVENING, Availability.WEEKENDS],
            interests: [Interest.TRAVEL, Interest.FOOD, Interest.MUSIC],
            areaId: areas[i % areas.length].id,
            nativeLangs: {
              connect: [{ id: createdLangs[0].id }]
            },
            learningLangs: {
              connect: [{ id: createdLangs[1].id }]
            }
          }
        }
      },
    })
    console.log(`Created user: ${user.email}`)
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
