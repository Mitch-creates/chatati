import { prisma } from "@/lib/prisma";

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
    district: {
      id: string;
      name: string;
      city: string;
      country: string;
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

export type DistrictOption = {
  id: string;
  name: string;
  city: string;
  country: string;
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
          district: {
            select: {
              id: true,
              name: true,
              city: true,
              country: true,
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
 * Get all available districts (optionally filter by city/country)
 */
export async function getAvailableDistricts(
  city?: string,
  country?: string
): Promise<DistrictOption[]> {
  return prisma.district.findMany({
    where: {
      ...(city && { city }),
      ...(country && { country }),
    },
    select: {
      id: true,
      name: true,
      city: true,
      country: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}
