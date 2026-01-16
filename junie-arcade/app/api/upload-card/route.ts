import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { validateApiKey, rateLimit, getClientIp, sanitizeString, isValidGameType, isValidScore } from "@/app/lib/auth";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    const authResult = validateApiKey(request);
    if (!authResult.valid) {
      return authResult.error;
    }

    // Rate limiting: 20 uploads per minute per IP
    const clientIp = getClientIp(request);
    const rateLimitResult = rateLimit(`upload:${clientIp}`, 20, 60000);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.error;
    }

    const { image, filename, username, score, gameType, country } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 });
    }

    // Validate inputs
    if (gameType && !isValidGameType(gameType)) {
      return NextResponse.json({ error: "Invalid game type" }, { status: 400 });
    }

    if (score !== undefined && !isValidScore(score)) {
      return NextResponse.json({ error: "Invalid score value" }, { status: 400 });
    }

    // Sanitize string inputs
    const sanitizedUsername = sanitizeString(username, 50);
    const sanitizedCountry = sanitizeString(country, 100);

    // Remove the data:image/(png|jpeg|webp);base64, prefix
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const bucketName = process.env.S3_BUCKET_NAME || "junies-arcade";
    const key = `cards/${filename || `card-${Date.now()}.png`}`;
    const contentType = filename?.endsWith('.jpg') || filename?.endsWith('.jpeg') ? "image/jpeg" : "image/png";

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await s3Client.send(command);

    const publicUrl = `https://${bucketName}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;

    // Save to database if metadata is provided
    if (sanitizedUsername && score !== undefined && gameType) {
      await prisma.galleryItem.create({
        data: {
          url: publicUrl,
          username: sanitizedUsername,
          score: Number.parseInt(score.toString()),
          gameType: gameType,
          country: sanitizedCountry || null,
        },
      });
    }

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error("S3 Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
