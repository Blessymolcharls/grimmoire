import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_USER_ID = "scholar-default-id";

async function main() {
  console.log("Beginning Hogwarts Library database seeding...");

  // 1. Ensure Scholar User exists
  const user = await prisma.user.upsert({
    where: { id: DEFAULT_USER_ID },
    update: {},
    create: {
      id: DEFAULT_USER_ID,
      email: "scholar@hogwarts.library",
      displayName: "Head Archivist",
    },
  });

  console.log(`User created or verified: ${user.displayName}`);

  // 2. Seed Default Magical Departments
  const departmentsData = [
    {
      slug: "charms",
      name: "Charms",
      description: "Fantasy, magical adventures, and imaginative worlds where wonder takes flight.",
      icon: "Sparkles",
      accentColor: "#A855F7",
      isSystem: true,
    },
    {
      slug: "potions",
      name: "Potions",
      description: "Romance, intricate relationships, and deeply brewing emotional stories.",
      icon: "FlaskConical",
      accentColor: "#F43F5E",
      isSystem: true,
    },
    {
      slug: "defense-against-the-dark-arts",
      name: "Defense Against the Dark Arts",
      description: "Horror, thrillers, crime, and suspenseful narratives that pierce the shadows.",
      icon: "ShieldAlert",
      accentColor: "#EA580C",
      isSystem: true,
    },
    {
      slug: "divination",
      name: "Divination",
      description: "Mysteries, psychological fiction, mind-bending puzzles, and speculative narratives.",
      icon: "Eye",
      accentColor: "#6366F1",
      isSystem: true,
    },
    {
      slug: "history-of-magic",
      name: "History of Magic",
      description: "Historical fiction, grand chronicles, and ancient historical legacies.",
      icon: "Scroll",
      accentColor: "#D97706",
      isSystem: true,
    },
    {
      slug: "transfiguration",
      name: "Transfiguration",
      description: "Transformative nonfiction, philosophical inquiries, and soul-altering personal growth.",
      icon: "Wand2",
      accentColor: "#10B981",
      isSystem: true,
    },
    {
      slug: "care-of-magical-creatures",
      name: "Care of Magical Creatures",
      description: "Tales of nature, wildlife, animal companions, and the breathing wilderness.",
      icon: "Feather",
      accentColor: "#14B8A6",
      isSystem: true,
    },
    {
      slug: "astronomy-tower",
      name: "Astronomy Tower",
      description: "Science, cosmos, astrophysics, astronomy, and journeys into the great expanse.",
      icon: "Compass",
      accentColor: "#38BDF8",
      isSystem: true,
    },
    {
      slug: "restricted-section",
      name: "Restricted Section",
      description: "Personally designated sacred relics, intense masterpieces, and private obsessions.",
      icon: "KeyRound",
      accentColor: "#E11D48",
      isSystem: true,
    },
  ];

  const departmentMap = new Map<string, string>();

  for (const dept of departmentsData) {
    const existing = await prisma.department.findFirst({
      where: { slug: dept.slug, userId: null },
    });

    if (existing) {
      departmentMap.set(dept.slug, existing.id);
    } else {
      const created = await prisma.department.create({
        data: dept,
      });
      departmentMap.set(dept.slug, created.id);
    }
  }

  console.log(`Seeded ${departmentsData.length} magical departments.`);

  // 3. Seed Reading Goal for current year
  const currentYear = new Date().getFullYear();
  await prisma.readingGoal.upsert({
    where: {
      userId_year: {
        userId: user.id,
        year: currentYear,
      },
    },
    update: { targetBooks: 24 },
    create: {
      userId: user.id,
      year: currentYear,
      targetBooks: 24,
    },
  });

  // 4. Seed Atmospheric Books if none exist yet
  const bookCount = await prisma.book.count({ where: { userId: user.id } });
  if (bookCount === 0) {
    console.log("Seeding initial library collection...");

    const nameOfTheWind = await prisma.book.create({
      data: {
        userId: user.id,
        title: "The Name of the Wind",
        normalizedTitle: "the name of the wind",
        authors: JSON.stringify(["Patrick Rothfuss"]),
        description:
          "Told in Kvothe's own voice, this is the tale of the magically gifted young man who grows to be the most notorious wizard his world has ever seen.",
        coverUrl: "https://covers.openlibrary.org/b/id/8315808-L.jpg",
        publicationYear: 2007,
        publisher: "DAW Books",
        isbn10: "0756404746",
        isbn13: "9780756404741",
        pageCount: 662,
        externalProvider: "openlibrary",
        readingStatus: "COMPLETED",
        rating: 5,
        isFavorite: true,
        dateStarted: new Date("2026-01-05"),
        dateCompleted: new Date("2026-01-28"),
        currentPage: 662,
        personalReview:
          "An absolute masterpiece of atmospheric storytelling. The prose flows like ancient music, and the University feels like a true spiritual predecessor to our castle halls.",
        favoriteCharacter: "Kvothe (and Auri)",
        notes:
          "Read late at night wrapped in woolen blankets by the fire. The silence of three parts gave me goosebumps every single time.",
        spineColor: "#7B1FA2",
      },
    });

    // Assign departments
    if (departmentMap.has("charms")) {
      await prisma.bookDepartment.create({
        data: { bookId: nameOfTheWind.id, departmentId: departmentMap.get("charms")! },
      });
    }
    if (departmentMap.has("restricted-section")) {
      await prisma.bookDepartment.create({
        data: { bookId: nameOfTheWind.id, departmentId: departmentMap.get("restricted-section")! },
      });
    }

    // Quotes
    await prisma.quote.create({
      data: {
        bookId: nameOfTheWind.id,
        text: "It was a night made for staying indoors, listening to the crackle of a fire and the whistling of the wind outside.",
        pageNumber: 3,
        personalNote: "The opening atmosphere is unforgettable.",
      },
    });
    await prisma.quote.create({
      data: {
        bookId: nameOfTheWind.id,
        text: "Words can light fires in the minds of men. Words can wring tears from the hardest hearts.",
        pageNumber: 260,
      },
    });

    // Book 2: The Shadow of the Wind
    const shadowOfTheWind = await prisma.book.create({
      data: {
        userId: user.id,
        title: "The Shadow of the Wind",
        normalizedTitle: "the shadow of the wind",
        authors: JSON.stringify(["Carlos Ruiz Zafón"]),
        description:
          "Barcelona, 1945: A city slowly heals in the aftermath of the Spanish Civil War, and Daniel, an antiquarian book dealer's son, is taken to the secret Cemetery of Forgotten Books.",
        coverUrl: "https://covers.openlibrary.org/b/id/10543632-L.jpg",
        publicationYear: 2001,
        publisher: "Penguin",
        isbn13: "9780143034902",
        pageCount: 487,
        externalProvider: "openlibrary",
        readingStatus: "COMPLETED",
        rating: 5,
        isFavorite: true,
        dateStarted: new Date("2026-02-02"),
        dateCompleted: new Date("2026-02-20"),
        currentPage: 487,
        personalReview:
          "Every time a book changes hands, every time someone runs down its pages, its spirit grows and strengthens. An ode to bibliophiles everywhere.",
        favoriteCharacter: "Fermín Romero de Torres",
        notes: "The Cemetery of Forgotten Books feels like a twin brother to this very Hogwarts Library.",
        spineColor: "#B71C1C",
      },
    });

    if (departmentMap.has("divination")) {
      await prisma.bookDepartment.create({
        data: { bookId: shadowOfTheWind.id, departmentId: departmentMap.get("divination")! },
      });
    }
    if (departmentMap.has("charms")) {
      await prisma.bookDepartment.create({
        data: { bookId: shadowOfTheWind.id, departmentId: departmentMap.get("charms")! },
      });
    }

    await prisma.quote.create({
      data: {
        bookId: shadowOfTheWind.id,
        text: "Every book, every volume you see here, has a soul. The soul of the person who wrote it and of those who read it and lived and dreamed with it.",
        pageNumber: 5,
        personalNote: "The core motto of our reading life.",
      },
    });

    // Book 3: A Short History of Nearly Everything
    const shortHistory = await prisma.book.create({
      data: {
        userId: user.id,
        title: "A Short History of Nearly Everything",
        normalizedTitle: "a short history of nearly everything",
        authors: JSON.stringify(["Bill Bryson"]),
        description:
          "One of the world's most beloved writers takes on the ultimate challenge: how did we get from there - being nothing at all - to here - being us?",
        coverUrl: "https://covers.openlibrary.org/b/id/8231856-L.jpg",
        publicationYear: 2003,
        publisher: "Broadway Books",
        isbn13: "9780767908184",
        pageCount: 544,
        externalProvider: "openlibrary",
        readingStatus: "CURRENTLY_READING",
        rating: 4,
        isFavorite: false,
        dateStarted: new Date("2026-03-01"),
        currentPage: 320,
        personalReview: "Brilliant, witty exploration of natural philosophy and the cosmos.",
        favoriteCharacter: "Father Thomas Evans",
        notes: "Reading in the Astronomy Tower overlooking the lake.",
        spineColor: "#0D47A1",
      },
    });

    if (departmentMap.has("astronomy-tower")) {
      await prisma.bookDepartment.create({
        data: { bookId: shortHistory.id, departmentId: departmentMap.get("astronomy-tower")! },
      });
    }
    if (departmentMap.has("history-of-magic")) {
      await prisma.bookDepartment.create({
        data: { bookId: shortHistory.id, departmentId: departmentMap.get("history-of-magic")! },
      });
    }

    // Book 4: Frankenstein
    const frankenstein = await prisma.book.create({
      data: {
        userId: user.id,
        title: "Frankenstein; or, The Modern Prometheus",
        normalizedTitle: "frankenstein",
        authors: JSON.stringify(["Mary Shelley"]),
        description:
          "A gothic masterpiece confronting the boundaries of life, ambition, monstrosity, and the longing for companionship in a harsh world.",
        coverUrl: "https://covers.openlibrary.org/b/id/8386154-L.jpg",
        publicationYear: 1818,
        publisher: "Lackington, Hughes, Harding, Mavor, & Jones",
        pageCount: 280,
        externalProvider: "openlibrary",
        readingStatus: "COMPLETED",
        rating: 5,
        isFavorite: true,
        dateStarted: new Date("2026-02-22"),
        dateCompleted: new Date("2026-02-28"),
        currentPage: 280,
        personalReview:
          "Far more poignant and philosophical than modern pop culture remembers. The creature's voice is heartbreaking.",
        favoriteCharacter: "The Creature",
        notes: "Finished under stormy skies with rain beating against the gothic stained-glass windows.",
        spineColor: "#1B5E20",
      },
    });

    if (departmentMap.has("defense-against-the-dark-arts")) {
      await prisma.bookDepartment.create({
        data: { bookId: frankenstein.id, departmentId: departmentMap.get("defense-against-the-dark-arts")! },
      });
    }

    // Book 5: The Night Circus
    const nightCircus = await prisma.book.create({
      data: {
        userId: user.id,
        title: "The Night Circus",
        normalizedTitle: "the night circus",
        authors: JSON.stringify(["Erin Morgenstern"]),
        description:
          "The circus arrives without warning. No announcements precede it. It is simply there, when yesterday it was not. Le Cirque des Rêves.",
        coverUrl: "https://covers.openlibrary.org/b/id/7289568-L.jpg",
        publicationYear: 2011,
        publisher: "Doubleday",
        isbn13: "9780385534635",
        pageCount: 387,
        externalProvider: "openlibrary",
        readingStatus: "CURRENTLY_READING",
        rating: 4,
        isFavorite: false,
        dateStarted: new Date("2026-03-08"),
        currentPage: 160,
        personalReview: "Sumptuous imagery of black and white tents, caramel scent, and clockwork magic.",
        favoriteCharacter: "Marco and Celia",
        notes: "Feels like wandering through the courtyard of Hogwarts during an enchanted festival.",
        spineColor: "#E65100",
      },
    });

    if (departmentMap.has("charms")) {
      await prisma.bookDepartment.create({
        data: { bookId: nightCircus.id, departmentId: departmentMap.get("charms")! },
      });
    }
    if (departmentMap.has("potions")) {
      await prisma.bookDepartment.create({
        data: { bookId: nightCircus.id, departmentId: departmentMap.get("potions")! },
      });
    }

    // Book 6: Braiding Sweetgrass
    const braidingSweetgrass = await prisma.book.create({
      data: {
        userId: user.id,
        title: "Braiding Sweetgrass",
        normalizedTitle: "braiding sweetgrass",
        authors: JSON.stringify(["Robin Wall Kimmerer"]),
        description:
          "Indigenous Wisdom, Scientific Knowledge and the Teachings of Plants. An inspiring reflection on the living world.",
        coverUrl: "https://covers.openlibrary.org/b/id/10389274-L.jpg",
        publicationYear: 2013,
        publisher: "Milkweed Editions",
        isbn13: "9781571313560",
        pageCount: 390,
        externalProvider: "openlibrary",
        readingStatus: "WANT_TO_READ",
        currentPage: 0,
        notes: "Recommended by our herbology and magical creatures professors.",
        spineColor: "#004D40",
      },
    });

    if (departmentMap.has("care-of-magical-creatures")) {
      await prisma.bookDepartment.create({
        data: { bookId: braidingSweetgrass.id, departmentId: departmentMap.get("care-of-magical-creatures")! },
      });
    }
    if (departmentMap.has("transfiguration")) {
      await prisma.bookDepartment.create({
        data: { bookId: braidingSweetgrass.id, departmentId: departmentMap.get("transfiguration")! },
      });
    }

    // 5. Seed Reading Sessions
    await prisma.readingSession.create({
      data: {
        userId: user.id,
        bookId: shortHistory.id,
        startedAt: new Date("2026-03-05T20:00:00Z"),
        durationMinutes: 45,
        pagesRead: 40,
        note: "Chapters on thermodynamics and subatomic mysteries.",
      },
    });
    await prisma.readingSession.create({
      data: {
        userId: user.id,
        bookId: nightCircus.id,
        startedAt: new Date("2026-03-09T21:30:00Z"),
        durationMinutes: 60,
        pagesRead: 55,
        note: "The bonfire tent in the center of the circus.",
      },
    });

    // 6. Seed Journal Entries
    const journalEntry1 = await prisma.journalEntry.create({
      data: {
        userId: user.id,
        title: "The Scent of Old Parchment & Starlit Nights",
        content: `Today the autumn fog rolled through the Black Lake and gathered outside the tall stained-glass archways of the library. 
Sitting at the corner mahogany carrel with Carlos Ruiz Zafón's *The Shadow of the Wind*, I felt that timeless suspension where minutes cease to tick.

Reading is not merely deciphering marks on paper; it is conjuring memories that never happened to us, yet dwell within us forever. As Fermín said, every book preserved upon these high wooden shelves carries the beating heart of everyone who ever wept, wondered, or loved alongside it.`,
        entryDate: new Date("2026-02-18T18:00:00Z"),
      },
    });

    await prisma.journalEntryBook.create({
      data: {
        journalEntryId: journalEntry1.id,
        bookId: shadowOfTheWind.id,
      },
    });

    const journalEntry2 = await prisma.journalEntry.create({
      data: {
        userId: user.id,
        title: "Whispers of Prometheus in the Deep Winter",
        content: `Finished Mary Shelley's *Frankenstein* as midnight struck. It is startling how different Victor's tragedy is from the vulgar Hollywood monsters. 
The Creature's speech upon the Mer de Glace is pure, unadorned heartbreak. How easily we shun what we cannot comprehend, and create the demons we claim to fear.`,
        entryDate: new Date("2026-02-28T23:55:00Z"),
      },
    });

    await prisma.journalEntryBook.create({
      data: {
        journalEntryId: journalEntry2.id,
        bookId: frankenstein.id,
      },
    });

    console.log("Seeded initial books, quotes, sessions, and journal entries.");
  }

  console.log("Hogwarts Library database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during database seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
