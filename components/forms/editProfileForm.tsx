// TODO Implement Cloudflare R2 for image storage

// Next steps: 
// Fix the schema by importing/defining the enums
// Implement the edit profile form component
// Connect the form to the edit account page
// Add API endpoint/server action for profile updates
// Add missing translations
//Handle district/language data fetching for dropdowns

"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { getEditProfileSchema } from "@/lib/zod-schemas/editProfileSchema";
import { EditProfileFormData } from "@/lib/zod-schemas/editProfileSchema";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardFooter } from "../ui/card";
import { ImageUpload } from "../image-upload";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { MultiSelectCombobox } from "../ui/multi-select-combobox";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Gender, Interest, Availability } from "@prisma/client";
import CtaButton from "../cta-button";

export function EditProfileForm() {
  const validationMessages = useTranslations("validation");
  const editProfileMessages = useTranslations("editProfile");

  const editProfileForm = useForm<EditProfileFormData>({
    resolver: zodResolver(getEditProfileSchema(validationMessages)),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      image: "",
      bio: "",
      gender: [],
      birthDate: new Date(),
      nativeLangs: [],
      learningLangs: [],
      district: "",
      preferenceDistrict: [],
      interests: [],
      availability: [],
    },
  });

  const [isPending, setIsPending] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const router = useRouter();
  const maxBioLength = 400;

  // TODO: Fetch from API/database
  // Mock data for now - replace with actual API calls
  const languageOptions = [
    { value: "lang-1", label: "Afrikaans" },
    { value: "lang-2", label: "Albanian" },
    { value: "lang-3", label: "Amharic" },
    { value: "lang-4", label: "Arabic" },
    { value: "lang-5", label: "Armenian" },
    { value: "lang-6", label: "Assyrian" },
    { value: "lang-7", label: "Azerbaijani" },
    { value: "lang-8", label: "Basque" },
    { value: "lang-9", label: "Bengali" },
    // Add more languages...
  ];

  const districtOptions = [
    { value: "dist-1", label: "Altona" },
    { value: "dist-2", label: "Bergedorf" },
    { value: "dist-3", label: "Eimsbüttel" },
    { value: "dist-4", label: "Harburg" },
    { value: "dist-5", label: "Mitte" },
    { value: "dist-6", label: "Nord" },
    { value: "dist-7", label: "Wandsbek" },
    // Add more districts...
  ];

  const interestOptions = Object.values(Interest).map((interest) => ({
    value: interest,
    label: interest.charAt(0) + interest.slice(1).toLowerCase().replace(/_/g, " "),
  }));

  const availabilityOptions = [
    { value: Availability.DAYTIME, label: editProfileMessages("availabilityDaytime") },
    { value: Availability.EVENING, label: editProfileMessages("availabilityEvening") },
    { value: Availability.WEEKENDS, label: editProfileMessages("availabilityWeekends") },
  ];

  const handleImageChange = (file: File | null, previewUrl: string | null) => {
    setImageFile(file);
    setImagePreview(previewUrl);
    
    // Clear any previous errors
    setImageError(null);
    editProfileForm.clearErrors("image");
    
    // Update form value
    if (previewUrl) {
      editProfileForm.setValue("image", "cropped", { shouldValidate: false });
    } else {
      editProfileForm.setValue("image", "", { shouldValidate: false });
    }
  };

  const handleImageError = (error: string) => {
    if (error && error.trim()) {
      setImageError(error);
      editProfileForm.setError("image", {
        type: "manual",
        message: error,
      });
    } else {
      // Clear error if empty string is passed
      setImageError(null);
      editProfileForm.clearErrors("image");
    }
  };

  const onSubmit = async (data: EditProfileFormData) => {
    // TODO: Handle file upload to Cloudflare R2
    console.log("Form data:", data);
    console.log("Image file:", imageFile);
    console.log("Image preview URL:", imagePreview);
  };

  return (
    <form
          id="editProfileForm"
          className="w-full flex flex-col items-center space-y-4"
          onSubmit={editProfileForm.handleSubmit(onSubmit)}
          noValidate
        >
          <FieldGroup className="mb-8 mt-8 flex">
            <Controller
              name="image"
              control={editProfileForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="text-center">
                  
                  <ImageUpload
                    value={imagePreview}
                    onChange={handleImageChange}
                    onError={handleImageError}
                    validationMessages={validationMessages}
                    id="editProfile-image"
                    ariaLabel="Upload profile image"
                  />
                  <FieldLabel htmlFor="editProfile-image" className="w-full text-center justify-center">
                    {editProfileMessages("image")}
                  </FieldLabel>
                  {fieldState.invalid && (
                    <FieldError className="text-center" errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <Card className="w-1/2 border-2 border-black shadow-[4px_4px_0_0_black]">
            <CardContent>
              <FieldGroup className="mb-4 flex">
                <Controller
                  name="bio"
                  control={editProfileForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="editProfile-bio" className="w-full">
                        {editProfileMessages("bio")}
                      </FieldLabel>
                      <FieldDescription>
                        {editProfileMessages("bioDescription")}
                      </FieldDescription>
                      <Textarea
                        {...field}
                        id="editProfile-bio"
                        aria-invalid={fieldState.invalid}
                        placeholder={editProfileMessages("bioPlaceholder")}
                        className="w-full"
                        maxLength={maxBioLength}
                      />
                      <p className="text-sm text-muted-foreground">
                        {field.value?.length || 0} / {maxBioLength} {editProfileMessages("characters")}
                      </p>
                      {fieldState.invalid && (
                        <FieldError className="text-center" errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
              <FieldGroup className="mb-4 flex">
                <Controller
                  name="gender"
                  control={editProfileForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="editProfile-gender" className="w-full">
                        {editProfileMessages("gender")}
                      </FieldLabel>
                      <FieldDescription>
                        {editProfileMessages("genderDescription")}
                      </FieldDescription>
                      <RadioGroup
                        onValueChange={(value) => field.onChange([value as Gender])}
                        value={field.value[0] || ""}
                        id="editProfile-gender"
                        aria-invalid={fieldState.invalid}
                        className="flex flex-col gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="MALE" id="gender-male" />
                          <label htmlFor="gender-male" className="cursor-pointer">
                            {editProfileMessages("genderMale")}
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="FEMALE" id="gender-female" />
                          <label htmlFor="gender-female" className="cursor-pointer">
                            {editProfileMessages("genderFemale")}
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="X" id="gender-x" />
                          <label htmlFor="gender-x" className="cursor-pointer">
                            {editProfileMessages("genderX")}
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="PRIVATE" id="gender-private" />
                          <label htmlFor="gender-private" className="cursor-pointer">
                            {editProfileMessages("genderPrivate")}
                          </label>
                        </div>
                      </RadioGroup>
                      {fieldState.invalid && (
                        <FieldError className="text-center" errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
              <FieldGroup className="mb-4 flex">
                <Controller
                  name="birthDate"
                  control={editProfileForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="editProfile-birthDate" className="w-full">
                        {editProfileMessages("birthDate")}
                      </FieldLabel>
                      <FieldDescription>
                        {editProfileMessages("birthDateDescription")}
                      </FieldDescription>
                      <Input
                        {...field}
                        type="date"
                        id="editProfile-birthDate"
                        aria-invalid={fieldState.invalid}
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                        className="w-full"
                      />
                      {fieldState.invalid && (
                        <FieldError className="text-center" errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
              <FieldGroup className="mb-4 flex">
                <Controller
                  name="nativeLangs"
                  control={editProfileForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="editProfile-nativeLangs" className="w-full">
                        {editProfileMessages("nativeLangs")}
                      </FieldLabel>
                      <FieldDescription>
                        {editProfileMessages("nativeLangsDescription")}
                      </FieldDescription>
                      <MultiSelectCombobox
                        options={languageOptions} // TODO: Fetch from API/database
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={editProfileMessages("nativeLangsPlaceholder")}
                        searchPlaceholder={editProfileMessages("nativeLangsPlaceholder")}
                        id="editProfile-nativeLangs"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError className="text-center" errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
              <FieldGroup className="mb-4 flex">
                <Controller
                  name="learningLangs"
                  control={editProfileForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="editProfile-learningLangs" className="w-full">
                        {editProfileMessages("learningLangs")}
                      </FieldLabel>
                      <FieldDescription>
                        {editProfileMessages("learningLangsDescription")}
                      </FieldDescription>
                      <MultiSelectCombobox
                        options={languageOptions}
                        value={field.value || []}
                        onChange={field.onChange}
                        placeholder={editProfileMessages("learningLangsPlaceholder")}
                        searchPlaceholder={editProfileMessages("learningLangsPlaceholder")}
                        id="editProfile-learningLangs"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError className="text-center" errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
              <FieldGroup className="mb-4 flex">
                <Controller
                  name="district"
                  control={editProfileForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="editProfile-district" className="w-full">
                        {editProfileMessages("district")}
                      </FieldLabel>
                      <FieldDescription>
                        {editProfileMessages("districtDescription")}
                      </FieldDescription>
                      <MultiSelectCombobox
                        options={districtOptions}
                        value={field.value ? [field.value] : []}
                        onChange={(values) => field.onChange(values[0] || "")}
                        placeholder={editProfileMessages("districtPlaceholder")}
                        searchPlaceholder={editProfileMessages("districtPlaceholder")}
                        id="editProfile-district"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError className="text-center" errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
              <FieldGroup className="mb-4 flex">
                <Controller
                  name="preferenceDistrict"
                  control={editProfileForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="editProfile-preferenceDistrict" className="w-full">
                        {editProfileMessages("preferenceDistrict")}
                      </FieldLabel>
                      <FieldDescription>
                        {editProfileMessages("preferenceDistrictDescription")}
                      </FieldDescription>
                      <MultiSelectCombobox
                        options={districtOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={editProfileMessages("preferenceDistrictPlaceholder")}
                        searchPlaceholder={editProfileMessages("preferenceDistrictPlaceholder")}
                        id="editProfile-preferenceDistrict"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError className="text-center" errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
              <FieldGroup className="mb-4 flex">
                <Controller
                  name="interests"
                  control={editProfileForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="editProfile-interests" className="w-full">
                        {editProfileMessages("interests")}
                      </FieldLabel>
                      <FieldDescription>
                        {editProfileMessages("interestsDescription")}
                      </FieldDescription>
                      <MultiSelectCombobox
                        options={interestOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={editProfileMessages("interestsPlaceholder")}
                        searchPlaceholder={editProfileMessages("interestsPlaceholder")}
                        id="editProfile-interests"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError className="text-center" errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
              <FieldGroup className="mb-4 flex">
                <Controller
                  name="availability"
                  control={editProfileForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="editProfile-availability" className="w-full">
                        {editProfileMessages("availability")}
                      </FieldLabel>
                      <FieldDescription>
                        {editProfileMessages("availabilityDescription")}
                      </FieldDescription>
                      <div className="flex flex-col gap-2">
                        {availabilityOptions.map((option) => (
                          <div key={option.value} className="flex items-center gap-2">
                            <Checkbox
                              id={`availability-${option.value}`}
                              checked={field.value.includes(option.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...field.value, option.value]);
                                } else {
                                  field.onChange(field.value.filter((v) => v !== option.value));
                                }
                              }}
                              className="border-2 border-black data-[state=checked]:bg-black data-[state=checked]:text-white"
                            />
                            <label
                              htmlFor={`availability-${option.value}`}
                              className="cursor-pointer"
                            >
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                      {fieldState.invalid && (
                        <FieldError className="text-center" errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </CardContent>
            <CardFooter className="pt-0 pb-6">
              <CtaButton
                type="submit"
                form="editProfileForm"
                disabled={isPending}
                fullWidth="w-full"
              >
                {isPending
                  ? editProfileMessages("saving")?.toUpperCase() || "SAVING..."
                  : editProfileMessages("save")?.toUpperCase() || "SAVE PROFILE"}
              </CtaButton>
            </CardFooter>
          </Card>
        </form>
  )
}