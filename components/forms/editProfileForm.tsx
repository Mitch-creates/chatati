"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, SubmitHandler } from "react-hook-form";
import { useTranslations, useLocale } from "next-intl";
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
import { useEffect } from "react";
import { Spinner } from "../ui/spinner";
import { Check, CircleCheckBigIcon, LucideTrash, Trash, Trash2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import RegularButton from "../regular-button";

interface Option {
  value: string;
  label: string;
}

export function EditProfileForm() {
  const validationMessages = useTranslations("validation");
  const editProfileMessages = useTranslations("editProfile");
  const languageMessages = useTranslations("languages");
  const interestMessages = useTranslations("editProfile.interestsList");
  const locale = useLocale();

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
      area: "",
      preferenceAreas: [],
      interests: [],
      availability: [],
    },
  });

  const [isPending, setIsPending] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [languageOptions, setLanguageOptions] = useState<Option[]>([]);
  const [areaOptions, setAreaOptions] = useState<Option[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [hasProfileImage, setHasProfileImage] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const router = useRouter();
  const maxBioLength = 400;

  useEffect(() => {
    // Show buttons if there's either an existing image (currentImageUrl) or a newly selected one (imagePreview)
    setHasProfileImage(!!(currentImageUrl || imagePreview));
  }, [currentImageUrl, imagePreview]);

  // Fetch initial data (available options and user profile)
  useEffect(() => {
    async function fetchData() {
      try {
        const [configRes, userRes] = await Promise.all([
          fetch("/api/config"),
          fetch("/api/users"),
        ]);

        if (configRes.ok) {
          const config = await configRes.json();
          const translatedLangs = config.languages.map((l: any) => ({
            value: l.id,
            label: languageMessages.has(l.code) ? languageMessages(l.code) : l.name,
          }));

          // Sort languages alphabetically based on translated label
          translatedLangs.sort((a: any, b: any) => a.label.localeCompare(b.label, locale));

          setLanguageOptions(translatedLangs);
          setAreaOptions(
            config.areas
              .map((a: any) => ({ value: a.id, label: a.name }))
              .sort((a: any, b: any) => a.label.localeCompare(b.label, locale))
          );
        }

        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.profile) {
            const profile = userData.profile;
            editProfileForm.reset({
              image: userData.image || "",
              bio: profile.bio || "",
              gender: profile.gender ? [profile.gender] : [],
              birthDate: userData.birthDate ? new Date(userData.birthDate) : new Date(),
              nativeLangs: profile.nativeLangs.map((l: any) => l.id),
              learningLangs: profile.learningLangs.map((l: any) => l.id),
              area: profile.area?.id || "",
              preferenceAreas: profile.preferenceAreas?.map((a: any) => a.id) || [],
              interests: profile.interests || [],
              availability: profile.availability || [],
            });
            // Set image preview and current URL if image exists
            if (userData.image) {
              setImagePreview(userData.image);
              setCurrentImageUrl(userData.image);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setIsLoadingData(false);
      }
    }

    fetchData();
  }, [editProfileForm]);

  const interestOptions = Object.values(Interest)
    .map((interest) => ({
      value: interest,
      label: interestMessages(interest) || interest,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, locale));

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

  const onSubmit: SubmitHandler<EditProfileFormData> = async (data) => {
    setIsPending(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for image upload

    try {
      // Upload image if a new one was selected
      let imageUrl = data.image;

      if (imageFile && imagePreview && data.image === "cropped") {
        // Upload the cropped file to R2
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadResponse = await fetch("/api/images/upload", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json().catch(() => ({}));
          const errorMessage = errorData.message || errorData.error || "Failed to upload image";
          console.error("Image upload failed:", errorData);
          throw new Error(errorMessage);
        }

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.url;

        // Delete old image if it exists, is different, and is from R2
        if (currentImageUrl && currentImageUrl !== imageUrl && (currentImageUrl.startsWith("http://") || currentImageUrl.startsWith("https://"))) {
          // The API will validate that it's an R2 URL
          try {
            console.log(`Deleting old image: ${currentImageUrl}`);
            const deleteResponse = await fetch(`/api/images/upload?url=${encodeURIComponent(currentImageUrl)}`, {
              method: "DELETE",
              signal: controller.signal,
            });
            if (!deleteResponse.ok) {
              const errorData = await deleteResponse.json().catch(() => ({}));
              console.warn("Failed to delete old image (non-critical):", errorData.message || errorData.error || "Unknown error");
            } else {
              console.log(`Successfully deleted old image: ${currentImageUrl}`);
            }
          } catch (deleteError) {
            // Log but don't fail the request if deletion fails
            console.warn("Failed to delete old image:", deleteError);
          }
        }
      } else if (data.image === "" && currentImageUrl) {
        // User removed the image - delete from R2 if it's an R2 URL
        if (currentImageUrl.startsWith("http://") || currentImageUrl.startsWith("https://")) {
          try {
            console.log(`Deleting removed image: ${currentImageUrl}`);
            const deleteResponse = await fetch(`/api/images/upload?url=${encodeURIComponent(currentImageUrl)}`, {
              method: "DELETE",
              signal: controller.signal,
            });
            if (!deleteResponse.ok) {
              const errorData = await deleteResponse.json().catch(() => ({}));
              console.warn("Failed to delete removed image (non-critical):", errorData.message || errorData.error || "Unknown error");
            } else {
              console.log(`Successfully deleted removed image: ${currentImageUrl}`);
            }
          } catch (deleteError) {
            console.warn("Failed to delete removed image:", deleteError);
          }
        }
        imageUrl = "";
      }

      // Update profile with the image URL (empty string if removed)
      const response = await fetch("/api/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          image: imageUrl || "",
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Profile update failed:", errorData);
        throw new Error(errorData.message || "Failed to update profile");
      }

      // Update current image URL to the new one (or clear it)
      setCurrentImageUrl(imageUrl || null);

      setSubmitSuccess(true);

      // Clear success state after 2.5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 2500);

    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error("Error updating profile:", error);

      const errorMessage = error.message || editProfileMessages("genericError");
      setSubmitError(errorMessage);

      // Clear error after 4 seconds
      setTimeout(() => {
        setSubmitError(null);
      }, 4000);
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    if (currentImageUrl) {
      setHasProfileImage(true);
    } else {
      setHasProfileImage(false);
    }
  }, [currentImageUrl]);

  if (isLoadingData) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const handleEditProfileImage = () => {
    // Trigger the file input click
    const fileInput = document.getElementById("editProfile-image") as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleRemoveProfileImage = () => {
    // Clear image state
    setImagePreview(null);
    setImageFile(null);
    setCurrentImageUrl(null);
    setHasProfileImage(false);

    // Set form value to empty string to trigger deletion on submit
    editProfileForm.setValue("image", "", { shouldValidate: false });

    // Clear any image errors
    setImageError(null);
    editProfileForm.clearErrors("image");
  };

  return (
    <form
      id="editProfileForm"
      className="w-full flex flex-col items-center space-y-4 pb-12"
      onSubmit={editProfileForm.handleSubmit(onSubmit)}
      noValidate
    >
      <FieldGroup className="mb-8 mt-8 flex">
        <Controller
          name="image"
          control={editProfileForm.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="text-center">
              <div className="relative inline-flex items-center justify-center group">
                <ImageUpload
                  value={imagePreview}
                  onChange={handleImageChange}
                  onError={handleImageError}
                  validationMessages={validationMessages}
                  id="editProfile-image"
                  ariaLabel="Upload profile image"
                />
                {hasProfileImage && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full pointer-events-none">
                    <button
                      type="button"
                      onClick={handleEditProfileImage}
                      className="text-white font-bold hover:underline cursor-pointer pointer-events-auto"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveProfileImage}
                      className="text-white hover:text-red-400 transition-colors cursor-pointer pointer-events-auto"
                      aria-label="Remove image"
                    >
                      <Trash2Icon className="w-6 h-6" />
                    </button>
                  </div>
                )}
              </div>
              <FieldLabel htmlFor="editProfile-image" className={cn("w-full text-center justify-center", hasProfileImage ? "hidden" : "")}>
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
                    lang={locale === "de" ? "de-DE" : "en-GB"}
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
              name="area"
              control={editProfileForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="editProfile-area" className="w-full">
                    {editProfileMessages("district")}
                  </FieldLabel>
                  <FieldDescription>
                    {editProfileMessages("districtDescription")}
                  </FieldDescription>
                  <MultiSelectCombobox
                    options={areaOptions}
                    value={field.value ? [field.value] : []}
                    onChange={(values) => field.onChange(values[0] || "")}
                    placeholder={editProfileMessages("districtPlaceholder")}
                    searchPlaceholder={editProfileMessages("districtPlaceholder")}
                    id="editProfile-area"
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
              name="preferenceAreas"
              control={editProfileForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="editProfile-preferenceArea" className="w-full">
                    {editProfileMessages("preferenceDistrict")}
                  </FieldLabel>
                  <FieldDescription>
                    {editProfileMessages("preferenceDistrictDescription")}
                  </FieldDescription>
                  <MultiSelectCombobox
                    options={areaOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={editProfileMessages("preferenceDistrictPlaceholder")}
                    searchPlaceholder={editProfileMessages("preferenceDistrictPlaceholder")}
                    id="editProfile-preferenceArea"
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
            {!submitSuccess && !submitError && (
              editProfileMessages("save")?.toUpperCase() || "SAVE PROFILE"
            )}
            {submitSuccess && (
              <div className="flex items-center justify-center gap-2">
                <CircleCheckBigIcon className="h-5 w-5 text-black" strokeWidth={3} /> <span>{editProfileMessages("updateSuccess")?.toUpperCase() || "Profile updated successfully!"}</span>
              </div>
            )}
            {submitError && (
              <span className="text-sm">
                {submitError.toUpperCase()}
              </span>
            )}
          </CtaButton>
        </CardFooter>
      </Card>
    </form>
  )
}