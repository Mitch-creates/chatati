import { z } from "zod";
import { Interest, Availability } from "@prisma/client";
// TODO define and import enums for interest, nativeLang, learningLang, availability
// TODO figure out how to handle preferedAreas and userArea
// As for now I want to target just Hamburg, but I wan't to define a good structure so it's easily scalable

export function getEditProfileSchema(t?: (key: string) => string,
availableLanguageIds?: string[],
availableDistrictIds?: string[]) {
  const baseSchema = z.object({
    image: z.string().optional(),
    description: z.string().optional(), // Optional description box of max 400 characters
    gender: z.enum(["male", "female", "x", "private"]), // Required field, default to private
    birthDate: z.date(), // Exact age not shown on profile. Used to filter on age category
    nativeLangs: z.array(z.string()).min(1, {
      message: t ? t("nativeLangsRequired") : "At least one native language is required",
    }), // Required field
    learningLangs: z.array(z.string()).optional(), // If you only wanna teach, no need to fill in learning langs
    district: z.string().optional(), 
    preferenceDistrict: z.array(z.string()),
    interests: z.array(z.enum(Interest)),
    availability: z.array(z.enum(Availability)),
  });

  if (availableLanguageIds || availableDistrictIds) {
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

        // Validate district IDs
        if (availableDistrictIds) {
          const allDistrictIds = [
            ...(data.preferenceDistrict || []),
            ...(data.district ? [data.district] : []),
          ];
          const invalidDistricts = allDistrictIds.filter(
            (id) => !availableDistrictIds.includes(id)
          );
          if (invalidDistricts.length > 0) return false;
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
  Awaited<ReturnType<typeof getEditProfileSchema>>
>;
