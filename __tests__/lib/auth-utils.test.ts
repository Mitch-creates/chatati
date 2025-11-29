import {
  getSessionHelper,
  requireAuthAPI,
  requireAuthAndEmailVerifiedAPI,
  getUser,
  isEmailVerified,
  UnauthorizedError,
  EmailNotVerifiedError,
} from "../../lib/auth-utils";
import { auth } from "../../lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// Mock dependencies
jest.mock("../../lib/auth", () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}));
jest.mock("next/headers");
jest.mock("next/navigation");

const mockHeaders = headers as jest.MockedFunction<typeof headers>;
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;
const mockAuth = auth as jest.Mocked<typeof auth>;

describe("auth-utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHeaders.mockResolvedValue(new Headers() as any);
  });

  describe("getSessionHelper", () => {
    it("should get session from auth.api.getSession", async () => {
      const mockSession = {
        user: { id: "user-1", email: "test@example.com", emailVerified: true },
      };

      mockAuth.api = {
        getSession: jest.fn().mockResolvedValue(mockSession),
      } as any;

      const result = await getSessionHelper();

      expect(mockAuth.api.getSession).toHaveBeenCalledWith({
        headers: expect.any(Headers),
      });
      expect(result).toEqual(mockSession);
    });

    it("should return null when no session exists", async () => {
      mockAuth.api = {
        getSession: jest.fn().mockResolvedValue(null),
      } as any;

      const result = await getSessionHelper();

      expect(result).toBeNull();
    });
  });

  describe("requireAuthAPI", () => {
    it("should return session when authenticated", async () => {
      const mockSession = {
        user: { id: "user-1", email: "test@example.com" },
      };

      mockAuth.api = {
        getSession: jest.fn().mockResolvedValue(mockSession),
      } as any;

      const result = await requireAuthAPI();

      expect(result).toEqual(mockSession);
    });

    it("should throw UnauthorizedError when not authenticated", async () => {
      mockAuth.api = {
        getSession: jest.fn().mockResolvedValue(null),
      } as any;

      await expect(requireAuthAPI()).rejects.toThrow(UnauthorizedError);
      await expect(requireAuthAPI()).rejects.toThrow("Unauthorized");
    });
  });

  describe("requireAuthAndEmailVerifiedAPI", () => {
    it("should return session when authenticated and email verified", async () => {
      const mockSession = {
        user: {
          id: "user-1",
          email: "test@example.com",
          emailVerified: true,
        },
      };

      mockAuth.api = {
        getSession: jest.fn().mockResolvedValue(mockSession),
      } as any;

      const result = await requireAuthAndEmailVerifiedAPI();

      expect(result).toEqual(mockSession);
    });

    it("should throw UnauthorizedError when not authenticated", async () => {
      mockAuth.api = {
        getSession: jest.fn().mockResolvedValue(null),
      } as any;

      await expect(requireAuthAndEmailVerifiedAPI()).rejects.toThrow(
        UnauthorizedError
      );
    });

    it("should throw EmailNotVerifiedError when email not verified", async () => {
      const mockSession = {
        user: {
          id: "user-1",
          email: "test@example.com",
          emailVerified: false,
        },
      };

      mockAuth.api = {
        getSession: jest.fn().mockResolvedValue(mockSession),
      } as any;

      await expect(requireAuthAndEmailVerifiedAPI()).rejects.toThrow(
        EmailNotVerifiedError
      );
      await expect(requireAuthAndEmailVerifiedAPI()).rejects.toThrow(
        "Email not verified"
      );
    });
  });

  describe("getUser", () => {
    it("should return user when session exists", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        emailVerified: true,
      };

      mockAuth.api = {
        getSession: jest.fn().mockResolvedValue({ user: mockUser }),
      } as any;

      const result = await getUser();

      expect(result).toEqual(mockUser);
    });

    it("should return undefined when no session exists", async () => {
      mockAuth.api = {
        getSession: jest.fn().mockResolvedValue(null),
      } as any;

      const result = await getUser();

      expect(result).toBeUndefined();
    });
  });

  describe("isEmailVerified", () => {
    it("should return true when email is verified", async () => {
      mockAuth.api = {
        getSession: jest.fn().mockResolvedValue({
          user: { emailVerified: true },
        }),
      } as any;

      const result = await isEmailVerified();

      expect(result).toBe(true);
    });

    it("should return false when email is not verified", async () => {
      mockAuth.api = {
        getSession: jest.fn().mockResolvedValue({
          user: { emailVerified: false },
        }),
      } as any;

      const result = await isEmailVerified();

      expect(result).toBe(false);
    });

    it("should return undefined when no user exists", async () => {
      mockAuth.api = {
        getSession: jest.fn().mockResolvedValue(null),
      } as any;

      const result = await isEmailVerified();

      expect(result).toBeUndefined();
    });
  });

  describe("Error classes", () => {
    it("UnauthorizedError should have correct name and message", () => {
      const error = new UnauthorizedError();
      expect(error.name).toBe("UnauthorizedError");
      expect(error.message).toBe("Unauthorized");
    });

    it("UnauthorizedError should accept custom message", () => {
      const error = new UnauthorizedError("Custom message");
      expect(error.message).toBe("Custom message");
    });

    it("EmailNotVerifiedError should have correct name and message", () => {
      const error = new EmailNotVerifiedError();
      expect(error.name).toBe("EmailNotVerifiedError");
      expect(error.message).toBe("Email not verified");
    });

    it("EmailNotVerifiedError should accept custom message", () => {
      const error = new EmailNotVerifiedError("Custom message");
      expect(error.message).toBe("Custom message");
    });
  });
});
