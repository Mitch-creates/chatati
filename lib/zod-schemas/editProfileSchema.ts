import { z } from "zod";
import { Gender, Interest, Availability } from "@prisma/client";
// TODO define and import enums for interest, nativeLang, learningLang, availability
// TODO figure out how to handle preferredAreas and userArea
// As for now I want to target just Hamburg, but I want to define a good structure so it's easily scalable

export function getEditProfileSchema(t?: (key: string) => string,
availableLanguageIds?: string[],
availableAreaIds?: string[]) {
  const baseSchema = z.object({
    image: z.string().optional(),
    bio: z.string().optional(), // Optional bio box of max 400 characters
    gender: z.array(z.enum(Gender)),
    birthDate: z.date(), // Exact age not shown on profile. Used to filter on age category
    nativeLangs: z.array(z.string()).min(1, {
      message: t ? t("nativeLangsRequired") : "At least one native language is required",
    }), // Required field
    learningLangs: z.array(z.string()).optional(), // If you only wanna teach, no need to fill in learning langs
    area: z.string().optional(), 
    preferenceAreas: z.array(z.string()),
    interests: z.array(z.enum(Interest)),
    availability: z.array(z.enum(Availability)),
  });

  if (availableLanguageIds || availableAreaIds) {
    return baseSchema.refine(
      (data) => {
        // Validate language IDs
        if (availableLanguageIds) {
          const allLangIds = [
            ...(data.nativeLangs || []),
            ...(data.learningLangs || []),
          ];
          const invalidLangs = allLangIds.filter(
            (id) => !availableLanguageIds.includes(id)
          );
          if (invalidLangs.length > 0) return false;
        }

        // Validate area IDs
        if (availableAreaIds) {
          const allAreaIds = [
            ...(data.preferenceAreas || []),
            ...(data.area ? [data.area] : []),
          ];
          const invalidAreas = allAreaIds.filter(
            (id) => !availableAreaIds.includes(id)
          );
          if (invalidAreas.length > 0) return false;
        }

        return true;
      },
      {
        message: t ? t("invalidSelection") : "Invalid selection",
      }
    );
  }

  return baseSchema;
}

export type EditProfileFormData = z.infer<
  ReturnType<typeof getEditProfileSchema>
>;
