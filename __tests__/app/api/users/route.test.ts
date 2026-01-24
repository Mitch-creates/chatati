// Mock next/server first to avoid Request is not defined error
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
      ...init,
    })),
  },
}));

// Mock dependencies - try using @/ with moduleNameMapper we added
jest.mock("@/lib/auth-utils", () => ({
  requireAuthAPI: jest.fn(),
  UnauthorizedError: class UnauthorizedError extends Error {
    constructor(message = "Unauthorized") {
      super(message);
      this.name = "UnauthorizedError";
    }
  },
}));

jest.mock("@/lib/services/user.service", () => ({
  getUserWithProfile: jest.fn(),
}));

// Import after mocks
import { NextResponse } from "next/server";
import { requireAuthAPI, UnauthorizedError } from "@/lib/auth-utils";
import { getUserWithProfile } from "@/lib/services/user.service";
import { GET } from "@/app/api/users/route";

const mockRequireAuthAPI = requireAuthAPI as jest.MockedFunction<
  typeof requireAuthAPI
>;
const mockGetUserWithProfile = getUserWithProfile as jest.MockedFunction<
  typeof getUserWithProfile
>;
const mockNextResponse = NextResponse as jest.Mocked<typeof NextResponse>;

describe("GET /api/users", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return user data when authenticated and user exists", async () => {
    const mockSession = {
      user: { id: "user-123", email: "test@example.com" },
    };

    const mockUser = {
      id: "user-123",
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

    mockRequireAuthAPI.mockResolvedValue(mockSession as any);
    mockGetUserWithProfile.mockResolvedValue(mockUser);

    const response = await GET();
    const responseData = await response.json();

    expect(mockRequireAuthAPI).toHaveBeenCalled();
    expect(mockGetUserWithProfile).toHaveBeenCalledWith("user-123");
    expect(mockNextResponse.json).toHaveBeenCalledWith(mockUser);
    expect(responseData).toEqual(mockUser);
  });

  it("should return 404 when user doesn't exist", async () => {
    const mockSession = {
      user: { id: "user-123", email: "test@example.com" },
    };

    mockRequireAuthAPI.mockResolvedValue(mockSession as any);
    mockGetUserWithProfile.mockResolvedValue(null);

    const response = await GET();
    const responseData = await response.json();

    expect(mockNextResponse.json).toHaveBeenCalledWith(
      {
        error: "userNotFound",
        message: "User not found",
      },
      { status: 404 }
    );
    expect(responseData).toEqual({
      error: "userNotFound",
      message: "User not found",
    });
    expect(response.status).toBe(404);
  });

  it("should return 401 when not authenticated", async () => {
    mockRequireAuthAPI.mockRejectedValue(new UnauthorizedError());

    const response = await GET();
    const responseData = await response.json();

    expect(mockNextResponse.json).toHaveBeenCalledWith(
      {
        error: "unauthorized",
        message: "Unauthorized",
      },
      { status: 401 }
    );
    expect(responseData).toEqual({
      error: "unauthorized",
      message: "Unauthorized",
    });
    expect(response.status).toBe(401);
    expect(mockGetUserWithProfile).not.toHaveBeenCalled();
  });

  it("should return 500 when unexpected error occurs", async () => {
    const mockSession = {
      user: { id: "user-123", email: "test@example.com" },
    };

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mockRequireAuthAPI.mockResolvedValue(mockSession as any);
    mockGetUserWithProfile.mockRejectedValue(new Error("Database error"));

    const response = await GET();
    const responseData = await response.json();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error in GET /api/users:",
      expect.any(Error)
    );
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      {
        error: "internalServerError",
        message: "Internal server error",
      },
      { status: 500 }
    );
    expect(responseData).toEqual({
      error: "internalServerError",
      message: "Internal server error",
    });
    expect(response.status).toBe(500);

    consoleErrorSpy.mockRestore();
  });

  it("should return user with profile when profile exists", async () => {
    const mockSession = {
      user: { id: "user-123", email: "test@example.com" },
    };

    const mockUser = {
      id: "user-123",
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
        availability: ["monday"],
        interests: ["coding"],
        area: {
          id: "area-1",
          name: "Altona",
          city: {
            id: "city-1",
            name: "Hamburg",
            country: {
              id: "country-1",
              name: "Germany",
            },
          },
        },
        nativeLangs: [{ id: "lang-1", code: "en", name: "English" }],
        learningLangs: [{ id: "lang-2", code: "de", name: "German" }],
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      },
    };

    mockRequireAuthAPI.mockResolvedValue(mockSession as any);
    mockGetUserWithProfile.mockResolvedValue(mockUser);

    const response = await GET();
    const responseData = await response.json();

    expect(responseData).toEqual(mockUser);
    expect(responseData.profile).toBeDefined();
    expect(responseData.profile.area).toBeDefined();
    expect(responseData.profile.nativeLangs).toHaveLength(1);
    expect(responseData.profile.learningLangs).toHaveLength(1);
  });
});
