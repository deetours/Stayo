import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Log the payload to the console
    console.log("=========================================");
    console.log("STAYO DEMO REQUEST RECEIVED:");
    console.log(JSON.stringify(body, null, 2));
    console.log("=========================================");
    
    // TODO: Integrate with real CRM (e.g., Salesforce, Hubspot, or simply forward via email)

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
