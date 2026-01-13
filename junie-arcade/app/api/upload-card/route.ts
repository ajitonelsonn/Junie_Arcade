import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function POST(request: Request) {
  try {
    const { image, filename, username, score, gameType, country, playerId } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 });
    }

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
    if (username && score !== undefined && gameType) {
      // If we have a playerId, use it to ensure we link to the right player
      // This is especially important for the overall card
      let linkedPlayerId = playerId;
      
      if (!linkedPlayerId) {
        const player = await prisma.player.findFirst({
          where: { username, country: country || null }
        });
        linkedPlayerId = player?.id;
      }

      await prisma.galleryItem.create({
        data: {
          url: publicUrl,
          username,
          score: parseInt(score.toString()),
          gameType: gameType as any,
          country: country || null,
        },
      });
    }

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error("S3 Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
