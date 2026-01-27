import { UserWithProfile } from "@/lib/services/user.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCachedTranslations, getTranslation } from "@/lib/i18n-helpers";
import { Gender, Availability, Interest } from "@prisma/client";

interface ProfileDetailsProps {
  user: UserWithProfile;
  locale: string;
}

function calculateAgeRange(birthDate: Date | null, profileMessages: Record<string, any>): string | null {
  if (!birthDate) return null;
  
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  // Return age range with translation
  if (age < 18) return getTranslation(profileMessages, "ageUnder18");
  if (age < 25) return getTranslation(profileMessages, "age18to24");
  if (age < 35) return getTranslation(profileMessages, "age25to34");
  if (age < 45) return getTranslation(profileMessages, "age35to44");
  if (age < 55) return getTranslation(profileMessages, "age45to54");
  if (age < 65) return getTranslation(profileMessages, "age55to64");
  return getTranslation(profileMessages, "age65plus");
}

function getGenderLabel(gender: Gender, profileMessages: Record<string, any>): string {
  switch (gender) {
    case Gender.MALE:
      return getTranslation(profileMessages, "genderMale");
    case Gender.FEMALE:
      return getTranslation(profileMessages, "genderFemale");
    case Gender.X:
      return getTranslation(profileMessages, "genderX");
    case Gender.PRIVATE:
      return getTranslation(profileMessages, "genderPrivate");
    default:
      return getTranslation(profileMessages, "genderPrivate");
  }
}

function getAvailabilityLabel(availability: Availability, profileMessages: Record<string, any>): string {
  switch (availability) {
    case Availability.DAYTIME:
      return getTranslation(profileMessages, "availabilityDaytime");
    case Availability.EVENING:
      return getTranslation(profileMessages, "availabilityEvening");
    case Availability.WEEKENDS:
      return getTranslation(profileMessages, "availabilityWeekends");
    default:
      return availability;
  }
}

function getInterestLabel(interest: Interest, editProfileMessages: Record<string, any>): string {
  const interestKey = `interestsList.${interest}`;
  return getTranslation(editProfileMessages, interestKey) || interest;
}

export default async function ProfileDetails({ user, locale }: ProfileDetailsProps) {
  const profileMessages = await getCachedTranslations(locale, "profile");
  const editProfileMessages = await getCachedTranslations(locale, "editProfile");
  const languageMessages = await getCachedTranslations(locale, "languages");

  if (!user.profile) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <Card className="border-2 border-black shadow-[4px_4px_0_0_black] rounded-lg">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {getTranslation(profileMessages, "noBio")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { profile } = user;
  const firstName = user.firstName || user.name.split(" ")[0] || user.name;
  const ageRange = calculateAgeRange(user.birthDate, profileMessages);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Bio Section */}
      {profile.bio && (
        <Card className="border-2 border-black shadow-[4px_4px_0_0_black] rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold uppercase">
              {getTranslation(profileMessages, "messageFrom").replace("{name}", firstName.toUpperCase())}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base">{profile.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Personal Details Section */}
      <Card className="border-2 border-black shadow-[4px_4px_0_0_black] rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold uppercase">
            {getTranslation(profileMessages, "personalDetails")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.gender !== Gender.PRIVATE && (
              <div>
                <span className="font-bold">{getTranslation(profileMessages, "gender")}: </span>
                <span>{getGenderLabel(profile.gender, profileMessages)}</span>
              </div>
            )}
            
            {ageRange && (
              <div>
                <span className="font-bold">{getTranslation(profileMessages, "age")}: </span>
                <span>{ageRange}</span>
              </div>
            )}

            {profile.nativeLangs.length > 0 && (
              <div>
                <span className="font-bold">{getTranslation(profileMessages, "nativeLanguage")}: </span>
                <span>
                  {profile.nativeLangs.map((lang, idx) => (
                    <span key={lang.id}>
                      {languageMessages[lang.code] || lang.name}
                      {idx < profile.nativeLangs.length - 1 && ", "}
                    </span>
                  ))}
                </span>
              </div>
            )}

            {profile.learningLangs.length > 0 && (
              <div>
                <span className="font-bold">{getTranslation(profileMessages, "learningLanguage")}: </span>
                <span>
                  {profile.learningLangs.map((lang, idx) => (
                    <span key={lang.id}>
                      {languageMessages[lang.code] || lang.name}
                      {idx < profile.learningLangs.length - 1 && ", "}
                    </span>
                  ))}
                </span>
              </div>
            )}

            {profile.area && (
              <div>
                <span className="font-bold">{getTranslation(profileMessages, "hometown")}: </span>
                <span>{profile.area.name}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Interests Section */}
      {profile.interests.length > 0 && (
        <Card className="border-2 border-black shadow-[4px_4px_0_0_black] rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold uppercase">
              {getTranslation(profileMessages, "interests")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 bg-accent-color2 border-2 border-black rounded-md font-medium"
                >
                  {getInterestLabel(interest, editProfileMessages)}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preferred Municipalities Section */}
      {profile.preferenceAreas.length > 0 && (
        <Card className="border-2 border-black shadow-[4px_4px_0_0_black] rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold uppercase">
              {getTranslation(profileMessages, "preferredMunicipalities")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.preferenceAreas.map((area) => (
                <span
                  key={area.id}
                  className="px-3 py-1 bg-white border-2 border-black rounded-md font-medium"
                >
                  {area.name}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Availabilities Section */}
      {profile.availability.length > 0 && (
        <Card className="border-2 border-black shadow-[4px_4px_0_0_black] rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold uppercase">
              {getTranslation(profileMessages, "availabilities")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.availability.map((availability) => (
                <span
                  key={availability}
                  className="px-3 py-1 bg-white border-2 border-black rounded-md font-medium"
                >
                  {getAvailabilityLabel(availability, profileMessages)}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
