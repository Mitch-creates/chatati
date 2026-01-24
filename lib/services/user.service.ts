import { prisma } from "@/lib/prisma";
import { Gender, Availability, Interest } from "@prisma/client";

/**
 * User service - handles all user-related database operations
 */

// Type for the user with profile (matches what we select from Prisma)
export type UserWithProfile = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  profile: {
    id: string;
    bio: string | null;
    jobfield: string | null;
    timezone: string;
    availability: string[];
    interests: string[];
    area: {
      id: string;
      name: string;
      city: {
        id: string;
        name: string;
        country: {
          id: string;
          name: string;
        };
      };
    } | null;
    nativeLangs: {
      id: string;
      code: string;
      name: string;
    }[];
    learningLangs: {
      id: string;
      code: string;
      name: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
  } | null;
};

export type LanguageOption = {
  id: string;
  code: string;
  name: string;
};

export type AreaOption = {
  id: string;
  name: string;
  city: {
    id: string;
    name: string;
    country: {
      id: string;
      name: string;
    };
  };
};

/**
 * Get user by ID with full profile information
 * @param userId - The user's ID
 * @returns User with profile or null if not found
 */
export async function getUserWithProfile(
  userId: string
): Promise<UserWithProfile | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      firstName: true,
      lastName: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      profile: {
        select: {
          id: true,
          bio: true,
          jobfield: true,
          timezone: true,
          availability: true,
          interests: true,
          area: {
            select: {
              id: true,
              name: true,
              city: {
                select: {
                  id: true,
                  name: true,
                  country: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
          nativeLangs: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          learningLangs: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });
}

export async function getAvailableLanguages(): Promise<LanguageOption[]> {
  return prisma.language.findMany({
    select: {
      id: true,
      code: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

/**
 * Get all available areas (optionally filter by city/country)
 */
export async function getAvailableAreas(
  cityId?: string,
  countryId?: string
): Promise<AreaOption[]> {
  return prisma.area.findMany({
    where: {
      ...(cityId && { cityId }),
      ...(countryId && {
        city: {
          countryId,
        },
      }),
    },
    select: {
      id: true,
      name: true,
      city: {
        select: {
          id: true,
          name: true,
          country: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
}

/**
 * Update user profile information
 * @param userId - The user's ID
 * @param data - The profile data to update
 * @returns The updated user with profile
 */
export async function updateUserProfile(
  userId: string,
  data: {
    image?: string;
    bio?: string;
    gender?: Gender[];
    birthDate?: Date;
    nativeLangs?: string[];
    learningLangs?: string[];
    area?: string;
    preferenceAreas?: string[];
    interests?: Interest[];
    availability?: Availability[];
  }
) {
  const {
    image,
    bio,
    gender,
    birthDate,
    nativeLangs,
    learningLangs,
    area,
    preferenceAreas,
    interests,
    availability,
  } = data;

  return prisma.$transaction(async (tx) => {
    // 1. Update User basic info
    await tx.user.update({
      where: { id: userId },
      data: {
        ...(image !== undefined && { image }),
        ...(birthDate !== undefined && { birthDate }),
      },
    });

    // 2. Update or create Profile
    return tx.profile.upsert({
      where: { userId },
      create: {
        userId,
        bio,
        gender: gender?.[0] || Gender.PRIVATE,
        timezone: "Europe/Berlin", // Default for now
        availability: availability || [],
        interests: interests || [],
        ...(area && { areaId: area }),
        ...(nativeLangs && {
          nativeLangs: {
            connect: nativeLangs.map((id) => ({ id })),
          },
        }),
        ...(learningLangs && {
          learningLangs: {
            connect: learningLangs.map((id) => ({ id })),
          },
        }),
        ...(preferenceAreas && {
          preferenceAreas: {
            connect: preferenceAreas.map((id) => ({ id })),
          },
        }),
      },
      update: {
        ...(bio !== undefined && { bio }),
        ...(gender !== undefined && { gender: gender[0] || Gender.PRIVATE }),
        ...(availability !== undefined && { availability }),
        ...(interests !== undefined && { interests }),
        ...(area !== undefined && { areaId: area || null }),
        ...(nativeLangs !== undefined && {
          nativeLangs: {
            set: nativeLangs.map((id) => ({ id })),
          },
        }),
        ...(learningLangs !== undefined && {
          learningLangs: {
            set: learningLangs.map((id) => ({ id })),
          },
        }),
        ...(preferenceAreas !== undefined && {
          preferenceAreas: {
            set: preferenceAreas.map((id) => ({ id })),
          },
        }),
      },
    });
  });
}
