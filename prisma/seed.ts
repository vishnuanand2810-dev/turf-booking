import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const VERIFIED_TURF_IMAGES = [
  "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80",
];

async function main() {
  console.log("Seeding database with Tamil Nadu District Turfs...");

  // Clean existing tables
  await prisma.booking.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.ground.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.user.deleteMany();

  // Create active coupons
  await prisma.coupon.createMany({
    data: [
      { code: "PITCH20", discountPercent: 20, label: "20% Stadium Pass Discount", active: true },
      { code: "TN30", discountPercent: 30, label: "30% Tamil Nadu Super Pass", active: true },
      { code: "PRO30", discountPercent: 30, label: "30% VIP Player Discount", active: true },
    ],
  });

  const rawGrounds = [
    // CHENNAI
    {
      name: "Chepauk Floodlight Arena",
      description: "Premier night cricket & 7v7 football turf with FIFA-grade 50mm artificial grass, LED floodlights, and dugout seating.",
      city: "CHENNAI",
      address: "Triplicane High Road, Near MA Chidambaram Stadium, Chennai",
      lat: 13.0627,
      lng: 80.2796,
      pricePaise: 180000,
      amenities: ["Floodlights", "Locker Room", "Parking", "Chilled Water", "Dugout Seats", "Scoreboard"],
      rating: 4.95,
    },
    {
      name: "ECR Coastal Pitch & Nets",
      description: "Scenic coastal turf with high-contrast night vision netting, spectator gallery, and automated bowling machines.",
      city: "CHENNAI",
      address: "Muttukadu, East Coast Road (ECR), Chennai",
      lat: 12.8021,
      lng: 80.2412,
      pricePaise: 160000,
      amenities: ["Sea Breeze Lounge", "Floodlights", "Bowling Machine", "Shower Room", "First Aid"],
      rating: 4.8,
    },
    {
      name: "Anna Nagar Night Stadium",
      description: "Rooftop panoramic turf stadium equipped with climate foggers, high-definition match recording, and pro gear rental.",
      city: "CHENNAI",
      address: "2nd Avenue, Near Tower Park, Anna Nagar, Chennai",
      lat: 13.085,
      lng: 80.2101,
      pricePaise: 200000,
      amenities: ["Rooftop View", "HD Recording", "Pro Equipment Rental", "Cafe & Refreshments"],
      rating: 4.9,
    },

    // COIMBATORE
    {
      name: "Kovai Champions Turf",
      description: "International standard multi-sport turf with high bouncy shockpads, professional night LED lights, and locker facilities.",
      city: "COIMBATORE",
      address: "Avinashi Road, Peelamedu, Coimbatore",
      lat: 11.0284,
      lng: 77.0028,
      pricePaise: 140000,
      amenities: ["Floodlights", "Locker Room", "Free Wi-Fi", "Dugout Seats", "Parking"],
      rating: 4.85,
    },
    {
      name: "RS Puram Floodlight Pitch",
      description: "Downtown Coimbatore turf arena featuring dual-court setup for cricket box matches and 5-a-side football.",
      city: "COIMBATORE",
      address: "DB Road, RS Puram, Coimbatore",
      lat: 11.0069,
      lng: 76.9525,
      pricePaise: 150000,
      amenities: ["Scoreboard", "Dual Pitch", "Chilled Beverages", "Shower Room"],
      rating: 4.75,
    },

    // MADURAI
    {
      name: "Meenakshi Night Arena",
      description: "State-of-the-art night match pitch equipped with anti-glare floodlights and comfortable spectator stand.",
      city: "MADURAI",
      address: "80 Feet Road, KK Nagar, Madurai",
      lat: 9.9252,
      lng: 78.1406,
      pricePaise: 130000,
      amenities: ["Anti-glare Lights", "Spectator Stand", "Water Dispenser", "Parking"],
      rating: 4.8,
    },
    {
      name: "Temple City Sports Turf",
      description: "Spacious multi-court complex for box cricket leagues, football tournaments, and corporate weekend matches.",
      city: "MADURAI",
      address: "Bypass Road, Ponmeni, Madurai",
      lat: 9.914,
      lng: 78.1012,
      pricePaise: 120000,
      amenities: ["Floodlights", "Tournament Setup", "Refreshment Kiosk", "Locker Room"],
      rating: 4.7,
    },

    // TIRUCHIRAPPALLI
    {
      name: "Rockfort Stadium Turf",
      description: "High-grade artificial grass pitch overlooking Rockfort view with complete night illumination and changing rooms.",
      city: "TIRUCHIRAPPALLI",
      address: "Main Road, Thillai Nagar, Tiruchirappalli",
      lat: 10.8281,
      lng: 78.6888,
      pricePaise: 130000,
      amenities: ["Changing Rooms", "High-Grade Turf", "Floodlights", "Parking"],
      rating: 4.82,
    },

    // SALEM
    {
      name: "Steel City Floodlight Turf",
      description: "Top-rated Salem night turf arena with pro shockpad turf, electronic scoreboard, and spacious dugout.",
      city: "SALEM",
      address: "Brindavan Road, Fairlands, Salem",
      lat: 11.6643,
      lng: 78.146,
      pricePaise: 120000,
      amenities: ["Electronic Scoreboard", "Shockpad Turf", "Floodlights", "Parking"],
      rating: 4.78,
    },

    // ERODE
    {
      name: "Turf Park Erode",
      description: "Modern night sports facility catering to cricket and football lovers with professional turf netting.",
      city: "ERODE",
      address: "Perundurai Road, Near Solar, Erode",
      lat: 11.341,
      lng: 77.7172,
      pricePaise: 110000,
      amenities: ["Netting", "Floodlights", "Chilled Beverages", "First Aid"],
      rating: 4.7,
    },

    // TIRUNELVELI
    {
      name: "Nellai Pitch & Nets",
      description: "Premier Tirunelveli sports turf featuring LED stadium floodlights, practice nets, and spectator seating.",
      city: "TIRUNELVELI",
      address: "High Ground Road, Palayamkottai, Tirunelveli",
      lat: 8.7139,
      lng: 77.7567,
      pricePaise: 110000,
      amenities: ["Practice Nets", "LED Lights", "Water Fountain", "Parking"],
      rating: 4.75,
    },

    // KANYAKUMARI
    {
      name: "Southern Tip Night Arena",
      description: "Coastal climate turf arena offering evening cricket box matches with sea view and high-definition lights.",
      city: "KANYAKUMARI",
      address: "Beach Road, Nagercoil, Kanyakumari",
      lat: 8.1833,
      lng: 77.4119,
      pricePaise: 120000,
      amenities: ["Sea View", "HD Floodlights", "Restroom", "Refreshments"],
      rating: 4.85,
    },

    // VELLORE
    {
      name: "Fort City Sports Arena",
      description: "Vellore's leading floodlit stadium turf with FIFA 50mm turf, locker room, and tournament camera stands.",
      city: "VELLORE",
      address: "Katpadi Main Road, Vellore",
      lat: 12.9165,
      lng: 79.1325,
      pricePaise: 130000,
      amenities: ["Camera Stands", "Locker Room", "FIFA Turf", "Floodlights"],
      rating: 4.8,
    },

    // KANCHEEPURAM
    {
      name: "Silk City Sports Turf",
      description: "Spacious box cricket and 6v6 football ground with night illumination and ample parking space.",
      city: "KANCHEEPURAM",
      address: "Chennai-Bengaluru Highway, Enathur, Kancheepuram",
      lat: 12.8342,
      lng: 79.7036,
      pricePaise: 120000,
      amenities: ["Floodlights", "Parking", "Water Dispenser", "First Aid"],
      rating: 4.72,
    },

    // DINDIGUL
    {
      name: "Dindigul Rock Stadium Pitch",
      description: "High bouncy shockpad cricket turf with night lighting and player dugout seats.",
      city: "DINDIGUL",
      address: "Trichy Road, Near Bus Stand, Dindigul",
      lat: 10.3673,
      lng: 77.9803,
      pricePaise: 110000,
      amenities: ["Player Dugout", "Floodlights", "Parking", "Juice Bar"],
      rating: 4.7,
    },

    // THANJAVUR
    {
      name: "Chola Night Arena",
      description: "Multi-sport turf stadium offering non-marking rubberized boundary nets and bright night lighting.",
      city: "THANJAVUR",
      address: "Medical College Road, Thanjavur",
      lat: 10.787,
      lng: 79.1378,
      pricePaise: 110000,
      amenities: ["Boundary Nets", "Floodlights", "Water Cooler", "First Aid"],
      rating: 4.75,
    },

    // NILGIRIS (OOTY)
    {
      name: "Ooty Misty Hills Pitch",
      description: "Hill-station mountain breeze turf with synthetic all-weather grass and high-intensity LED lights.",
      city: "NILGIRIS",
      address: "Charing Cross Road, Ooty, Nilgiris",
      lat: 11.4102,
      lng: 76.695,
      pricePaise: 150000,
      amenities: ["Mountain View", "All-Weather Turf", "Hot Showers", "Cafe"],
      rating: 4.9,
    },

    // CHENGALPATTU
    {
      name: "Mahabalipuram Turf Club",
      description: "Resort-style coastal turf with floodlights, swimming pool access, and pro match scoring.",
      city: "CHENGALPATTU",
      address: "ECR Highway, Mahabalipuram, Chengalpattu",
      lat: 12.6269,
      lng: 80.1927,
      pricePaise: 140000,
      amenities: ["Resort Ambience", "Pool Access", "Floodlights", "Parking"],
      rating: 4.84,
    },

    // TIRUPPUR
    {
      name: "Knitwear City Sports Arena",
      description: "Tiruppur's premier 7v7 turf arena equipped with FIFA 50mm grass and digital score monitors.",
      city: "TIRUPPUR",
      address: "Avinashi Road, Tiruppur",
      lat: 11.1085,
      lng: 77.3411,
      pricePaise: 130000,
      amenities: ["Digital Scoreboard", "FIFA Grass", "Floodlights", "Locker Room"],
      rating: 4.76,
    },

    // THOOTHUKUDI
    {
      name: "Pearl City Night Turf",
      description: "Floodlit turf ground situated close to harbour area with high nets and spectator seats.",
      city: "THOOTHUKUDI",
      address: "Beach Road, Harbour Area, Thoothukudi",
      lat: 8.7642,
      lng: 78.1348,
      pricePaise: 120000,
      amenities: ["Spectator Stand", "High Nets", "Floodlights", "Parking"],
      rating: 4.75,
    },

    // CUDDALORE
    {
      name: "Silver Beach Sports Pitch",
      description: "Clean coastal turf arena for night cricket matches with modern amenities and parking.",
      city: "CUDDALORE",
      address: "Silver Beach Road, Manjakuppam, Cuddalore",
      lat: 11.748,
      lng: 79.7714,
      pricePaise: 110000,
      amenities: ["Coastal Breeze", "Floodlights", "Parking", "Refreshment Stall"],
      rating: 4.7,
    },

    // KRISHNAGIRI
    {
      name: "Krishnagiri Highway Turf Arena",
      description: "Conveniently located on Chennai-Bengaluru highway with top-tier artificial grass and night lights.",
      city: "KRISHNAGIRI",
      address: "AH43 Highway Rd, Krishnagiri",
      lat: 12.5186,
      lng: 78.2137,
      pricePaise: 130000,
      amenities: ["Highway Location", "All-Night Floodlights", "Food Court", "Parking"],
      rating: 4.8,
    }
  ];

  for (let i = 0; i < rawGrounds.length; i++) {
    const item = rawGrounds[i];
    const primaryImg = VERIFIED_TURF_IMAGES[i % VERIFIED_TURF_IMAGES.length];
    const secondaryImg = VERIFIED_TURF_IMAGES[(i + 1) % VERIFIED_TURF_IMAGES.length];

    const ground = await prisma.ground.create({
      data: {
        name: item.name,
        description: item.description,
        city: item.city,
        address: item.address,
        lat: item.lat,
        lng: item.lng,
        pricePaise: item.pricePaise,
        rating: item.rating,
        amenities: JSON.stringify(item.amenities),
        images: JSON.stringify([primaryImg, secondaryImg]),
      },
    });

    // Generate slots for today and next 6 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const slotDate = new Date(today);
      slotDate.setDate(today.getDate() + dayOffset);

      for (let hour = 6; hour < 23; hour++) {
        const startTime = new Date(slotDate);
        startTime.setHours(hour, 0, 0, 0);

        const endTime = new Date(slotDate);
        endTime.setHours(hour + 1, 0, 0, 0);

        await prisma.slot.create({
          data: {
            groundId: ground.id,
            startTime,
            endTime,
            pricePaise: ground.pricePaise,
            status: "available",
          },
        });
      }
    }
  }

  console.log(`Database re-seeded with ${rawGrounds.length} verified Tamil Nadu district turfs!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
