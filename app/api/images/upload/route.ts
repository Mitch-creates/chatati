import { NextResponse } from "next/server";
import { requireAuthAPI, UnauthorizedError } from "@/lib/auth-utils";
import { uploadImageToR2, deleteImageFromR2, extractKeyFromR2Url } from "@/lib/services/r2.service";

export async function POST(request: Request) {
  try {
    const session = await requireAuthAPI();
    const userId = session.user.id;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique file name: userId-timestamp-random.extension
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const extension = file.name.split(".").pop() || "jpg";
    const fileName = `profile-images/${userId}-${timestamp}-${random}.${extension}`;

    // Upload to R2
    const imageUrl = await uploadImageToR2(buffer, fileName, file.type);

    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { error: "unauthorized", message: "Unauthorized" },
        { status: 401 }
      );
    }

    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "internalServerError", message: "Failed to upload image" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireAuthAPI();
    const url = new URL(request.url);
    const imageUrl = url.searchParams.get("url");

    if (!imageUrl) {
      return NextResponse.json(
        { error: "No image URL provided" },
        { status: 400 }
      );
    }

    // Extract the key from the URL
    const key = extractKeyFromR2Url(imageUrl);

    // Delete from R2
    await deleteImageFromR2(key);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { error: "unauthorized", message: "Unauthorized" },
        { status: 401 }
      );
    }

    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "internalServerError", message: "Failed to delete image" },
      { status: 500 }
    );
  }
}
