import { createClient } from "@/lib/supabase/server";
import { stripe, ADVENTURE_PRICE_CENTS } from "@/lib/stripe/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { adventureId, playthroughId } = await request.json();

    if (!adventureId || !playthroughId) {
      return NextResponse.json(
        { error: "Missing adventureId or playthroughId" },
        { status: 400 }
      );
    }

    // Get adventure title for the checkout
    const { data: adventure } = await supabase
      .from("adventures")
      .select("title")
      .eq("id", adventureId)
      .single();

    if (!adventure) {
      return NextResponse.json({ error: "Adventure not found" }, { status: 404 });
    }

    // Check if already purchased
    const { data: existingPurchase } = await supabase
      .from("purchases")
      .select("id, status")
      .eq("reader_id", user.id)
      .eq("adventure_id", adventureId)
      .eq("status", "paid")
      .single();

    if (existingPurchase) {
      return NextResponse.json({ error: "Already purchased" }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Lirae: ${adventure.title}`,
              description: "Unlock the full 10-chapter story",
            },
            unit_amount: ADVENTURE_PRICE_CENTS,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        adventureId,
        playthroughId,
      },
      success_url: `${siteUrl}/read/${playthroughId}?purchased=true`,
      cancel_url: `${siteUrl}/read/${playthroughId}?canceled=true`,
    });

    // Create pending purchase record
    await supabase.from("purchases").insert({
      reader_id: user.id,
      adventure_id: adventureId,
      stripe_session_id: session.id,
      amount_cents: ADVENTURE_PRICE_CENTS,
      status: "pending",
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
