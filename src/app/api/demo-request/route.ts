import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Log the payload to the console
    console.log("=========================================");
    console.log("STAYO DEMO REQUEST RECEIVED:");
    console.log(JSON.stringify(body, null, 2));
    console.log("=========================================");
    
    // Write to a local leads.json file so data is actually persisted
    const leadsFilePath = path.join(process.cwd(), "leads.json");
    let leads = [];
    if (fs.existsSync(leadsFilePath)) {
      leads = JSON.parse(fs.readFileSync(leadsFilePath, "utf8"));
    }
    leads.push({ ...body, timestamp: new Date().toISOString() });
    fs.writeFileSync(leadsFilePath, JSON.stringify(leads, null, 2));

    return NextResponse.json(
      { message: "Demo request received successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing demo request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
