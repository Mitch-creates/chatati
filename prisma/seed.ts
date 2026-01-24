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
