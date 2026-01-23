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
import { Card, CardContent } from "../ui/card";
import { ImageUpload } from "../image-upload";
import { Textarea } from "../ui/textarea";

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
                    <Field data-invalid={fieldState.invalid} className="text-center">
                      <FieldLabel htmlFor="editProfile-firstName" className="w-full text-center justify-center">
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
                      />
                      {fieldState.invalid && (
                        <FieldError className="text-center" errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </CardContent>
          </Card>
        </form>
  )
}