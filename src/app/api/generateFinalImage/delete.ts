import { deleteImageFromS3 } from "@/lib/s3";
import { NextRequest, NextResponse } from "next/server";

interface DeleteS3ImagesRequest {
  filenames: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: DeleteS3ImagesRequest = await request.json();
    if (
      !body.filenames ||
      !Array.isArray(body.filenames) ||
      body.filenames.length === 0
    ) {
      return NextResponse.json(
        { error: "No filenames provided" },
        { status: 400 }
      );
    }

    const deleted: string[] = [];
    const errors: { filename: string; error: string }[] = [];

    for (const filename of body.filenames) {
      try {
        await deleteImageFromS3(filename);
        deleted.push(filename);
      } catch (err) {
        errors.push({
          filename,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return NextResponse.json({ success: true, deleted, errors });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
