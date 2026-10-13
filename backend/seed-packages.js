const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const packagesToSeed = [
  // Birthday Balloon Decorations (from Screenshot 3)
  {
    name: 'Simple Birthday Decoration at Home',
    description: 'Chic pink and white metallic ceiling and floor balloons, custom age foil marquee, and happy birthday bunting.',
    details: 'Includes 70 metallic pink & white balloons, 1 silver "Happy Birthday" foil banner, 2 giant silver age foil numbers, ribbons, fairy lights, and professional decorator service.',
    price: 2499,
    imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80',
    isActive: true,
  },
  {
    name: 'Simple Birthday Decoration',
    description: 'Classic romantic red and metallic gold balloon room decor with bed balloons and floating ceiling clusters.',
    details: 'Includes 60 red and chrome gold balloons, 1 "Happy Birthday" golden foil banner, ceiling curled ribbons, and scented tea light candle accents.',
    price: 1799,
    imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
    isActive: true,
  },
  {
    name: 'Black and Silver Birthday Balloon Decoration at Home',
    description: 'Ultra-modern organic balloon arch in black, chrome silver, and white with round backdrop and cake pedestal.',
    details: 'Includes 100 premium chrome silver, black and pearl white balloons, 1 backdrop sunboard with customized neon or vinyl name, and cylinder cake stand.',
    price: 6699,
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    isActive: true,
  },
  {
    name: 'Indoor Birthday Decoration',
    description: 'Stunning full circular floral wreath arch with macaron cream, nude, and golden balloons with neon Happy Birthday sign.',
    details: 'Includes 7ft metal ring arch, 130 organic pastel and chrome gold balloons, pampas grass accents, warm white neon "Happy Birthday" light, and onsite setup.',
    price: 5999,
    imageUrl: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&w=800&q=80',
    isActive: true,
  },
  {
    name: 'Simple Hall Decoration',
    description: 'Vibrant blue, silver and white celebration setup with floating ceiling ribbons and floor clusters.',
    details: 'Includes 80 metallic blue, chrome silver and white balloons, hanging curled ribbons, star foils, and fairy light glow.',
    price: 1499,
    imageUrl: 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&fit=crop&w=800&q=80',
    isActive: true,
  },

  // Romantic & Anniversary Decorations (from Screenshot 4)
  {
    name: 'Elegant 25th Anniversary Balloon Decoration',
    description: 'Luxurious "Better Together" white acrylic backdrop with giant 25 LED light-up numbers and chrome blush garland.',
    details: 'Includes 8x6ft arched backdrop with "Better Together" calligraphy, marquee illuminated number 25, 110 blush pink, champagne gold and white balloons, and dried floral pampas grass.',
    price: 4999,
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    isActive: true,
  },
  {
    name: 'Romantic Anniversary Backdrop with Red and Pink Balloon Arch',
    description: 'Vibrant love celebration arch with red, hot pink, and blush balloons, mini red heart foils, and custom backdrop.',
    details: 'Includes 120 red and pink metallic balloons, 10 heart-shaped foil accents, "Happy Anniversary" circular sign, and fairy light illumination.',
    price: 3499,
    imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
    isActive: true,
  },
  {
    name: 'Anniversary Balloon Room Decoration',
    description: 'Intimate bedroom surprise with red heart foil balloons on ceiling, bed arrangement, and golden Happy Anniversary foil banner.',
    details: 'Includes 50 red latex balloons, 15 red heart foil balloons with hanging ribbons, 1 golden "Happy Anniversary" banner, and fresh rose petals on bed.',
    price: 2499,
    imageUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
    isActive: true,
  },
  {
    name: '50th Premium Anniversary Decoration',
    description: 'Golden jubilee milestone setup with round ring arch, illuminated golden 50 numbers, and luxury pleated candle pillars.',
    details: 'Includes 7ft circular ring arch, red and golden chrome garland, 50 illuminated numbers, 2 pleated cylindrical pedestals, and LED neon signs.',
    price: 6999,
    imageUrl: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=800&q=80',
    isActive: true,
  },
  {
    name: 'Lovely Anniversary Decoration',
    description: 'Classic romantic room transformation with ceiling red heart balloons, bed styling, and fairy light curtains.',
    details: 'Includes 40 red balloons, 10 heart foil balloons, fairy light string on headboard, and romantic scented tealight candles.',
    price: 1999,
    imageUrl: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80',
    isActive: true,
  },

  // Kids & Ceremonies
  {
    name: 'Kids 1st Birthday Adventure Balloon Setup',
    description: 'Joyful cartoon primary color balloon arch with customized name board and glowing marquee number 1.',
    details: 'Includes 100 yellow, red, sky blue and white balloons, customized round backdrop with child’s name, giant marquee 1, and plush toy props.',
    price: 3999,
    imageUrl: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=800&q=80',
    isActive: true,
  },
  {
    name: 'Newborn Welcome Cloud Balloon Arch',
    description: 'Serene powder blue and white cloud balloons with "Welcome Baby" acrylic board, pedestals, and giant teddy bear.',
    details: 'Includes 3 layered arch backdrops in baby blue, 100 pastel balloons, 3 white cylindrical pedestals, plush teddy bear, and cloud cutouts.',
    price: 3699,
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    isActive: true,
  },
  {
    name: 'Baby Shower Dual Arch Pastel Decor',
    description: 'Stunning pastel pink, baby blue and chrome gold dual arch setup with "Baby Shower" acrylic signage.',
    details: 'Includes dual ribbed arch panels, 110 pink & blue pastel balloons, cute baby bear cutouts, and floral touches.',
    price: 4499,
    imageUrl: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?auto=format&fit=crop&w=800&q=80',
    isActive: true,
  },
  {
    name: 'Traditional Haldi & Mehndi Marigold Setup',
    description: 'Vibrant yellow and orange marigold backdrop with traditional umbrellas, brass urli, and floral floor rangoli.',
    details: 'Includes yellow drape background, 12 marigold strings, brass urli with water and floating flowers, 2 Rajasthani traditional decorative umbrellas, and festive cushions.',
    price: 5999,
    imageUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
    isActive: true,
  },
]

async function seed() {
  console.log('Seeding exact celebration packages matching screenshots...')

  for (const item of packagesToSeed) {
    const existing = await prisma.decorationPackage.findFirst({
      where: { name: item.name },
    })

    if (existing) {
      await prisma.decorationPackage.update({
        where: { id: existing.id },
        data: item,
      })
      console.log(`Updated: ${item.name}`)
    } else {
      const created = await prisma.decorationPackage.create({ data: item })
      console.log(`Created: #${created.id} ${item.name}`)
    }
  }

  console.log('Seeding completed successfully!')
  process.exit(0)
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
