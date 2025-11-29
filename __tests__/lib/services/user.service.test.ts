// Mock Prisma - need to use relative path for jest.mock, but @/ works for imports
// Define mock function inside the factory to avoid hoisting issues
jest.mock("../../../lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

// Import after mocks - can use @/ alias here
import { getUserWithProfile } from "@/lib/services/user.service";
import { prisma } from "@/lib/prisma";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockFindUnique = mockPrisma.user.findUnique as jest.MockedFunction<
  typeof mockPrisma.user.findUnique
>;

describe("user.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserWithProfile", () => {
    const mockUserId = "user-123";

    it("should return user with full profile when user exists", async () => {
      const mockUser = {
        id: mockUserId,
        name: "Test User",
        email: "test@example.com",
        emailVerified: true,
        firstName: "Test",
        lastName: "User",
        image: null,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        profile: {
          id: "profile-123",
          bio: "Test bio",
          jobfield: "Developer",
          timezone: "Europe/Berlin",
          availability: ["monday", "tuesday"],
          interests: ["coding", "languages"],
          district: {
            id: "district-1",
            name: "Berlin",
            city: "Berlin",
            country: "Germany",
          },
          nativeLangs: [{ id: "lang-1", code: "en", name: "English" }],
          learningLangs: [{ id: "lang-2", code: "de", name: "German" }],
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
      };

      mockFindUnique.mockResolvedValue(mockUser as any);

      const result = await getUserWithProfile(mockUserId);

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: expect.objectContaining({
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          profile: expect.objectContaining({
            select: expect.objectContaining({
              district: expect.any(Object),
              nativeLangs: expect.any(Object),
              learningLangs: expect.any(Object),
            }),
          }),
        }),
      });

      expect(result).toEqual(mockUser);
    });

    it("should return user with null profile when profile doesn't exist", async () => {
      const mockUser = {
        id: mockUserId,
        name: "Test User",
        email: "test@example.com",
        emailVerified: true,
        firstName: "Test",
        lastName: "User",
        image: null,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        profile: null,
      };

      mockFindUnique.mockResolvedValue(mockUser as any);

      const result = await getUserWithProfile(mockUserId);

      expect(result).toEqual(mockUser);
      expect(result?.profile).toBeNull();
    });

    it("should return null when user doesn't exist", async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await getUserWithProfile(mockUserId);

      expect(result).toBeNull();
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: expect.any(Object),
      });
    });

    it("should handle profile with null district", async () => {
      const mockUser = {
        id: mockUserId,
        name: "Test User",
        email: "test@example.com",
        emailVerified: true,
        firstName: "Test",
        lastName: "User",
        image: null,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        profile: {
          id: "profile-123",
          bio: "Test bio",
          jobfield: null,
          timezone: "Europe/Berlin",
          availability: [],
          interests: [],
          district: null,
          nativeLangs: [],
          learningLangs: [],
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
      };

      mockFindUnique.mockResolvedValue(mockUser as any);

      const result = await getUserWithProfile(mockUserId);

      expect(result?.profile?.district).toBeNull();
    });

    it("should select only required fields", async () => {
      const mockUser = {
        id: mockUserId,
        name: "Test User",
        email: "test@example.com",
        emailVerified: true,
        firstName: "Test",
        lastName: "User",
        image: null,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        profile: null,
      };

      mockFindUnique.mockResolvedValue(mockUser as any);

      await getUserWithProfile(mockUserId);

      const callArgs = mockFindUnique.mock.calls[0][0];
      expect(callArgs.select).toBeDefined();
      expect(callArgs.select).not.toHaveProperty("accounts");
      expect(callArgs.select).not.toHaveProperty("sessions");
    });
  });
});
