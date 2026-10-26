import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    return NextResponse.json(
      { error: "IPFS upload is not configured. Set PINATA_JWT on the server." },
      { status: 503 },
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const sha256 = formData.get("sha256");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "A file is required." }, { status: 400 });
    }
    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Evidence files must be between 1 byte and 10 MB." },
        { status: 400 },
      );
    }
    if (typeof sha256 !== "string" || !/^0x[0-9a-f]{64}$/i.test(sha256)) {
      return NextResponse.json({ error: "A valid SHA-256 fingerprint is required." }, { status: 400 });
    }

    const upload = new FormData();
    upload.append("file", file, file.name);
    upload.append(
      "network",
      process.env.PINATA_NETWORK === "public" ? "public" : "private",
    );
    upload.append("metadata", JSON.stringify({ name: file.name, keyvalues: { sha256 } }));

    const response = await fetch("https://uploads.pinata.cloud/v3/files", {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}` },
      body: upload,
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("[Delivery Upload API] Pinata upload failed:", response.status, details);
      return NextResponse.json(
        { error: "IPFS provider rejected the evidence upload." },
        { status: 502 },
      );
    }

    const result = (await response.json()) as { data?: { cid?: string } };
    const cid = result.data?.cid;
    if (!cid) {
      console.error("[Delivery Upload API] Pinata response did not contain a CID.");
      return NextResponse.json({ error: "IPFS provider returned no CID." }, { status: 502 });
    }

    return NextResponse.json({ success: true, cid, sha256 });
  } catch (error) {
    console.error("[Delivery Upload API] Error:", error);
    return NextResponse.json(
      { error: "Failed to upload delivery evidence to IPFS." },
      { status: 500 },
    );
  }
}
