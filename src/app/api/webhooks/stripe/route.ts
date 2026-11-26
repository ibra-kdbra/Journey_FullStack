import { db } from "@/db"
import { stripe } from "@/lib/stripe"
import { headers } from "next/headers"
import Stripe from "stripe"

export async function POST(req: Request) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
        console.error("STRIPE_WEBHOOK_SECRET is not configured")
        return new Response("Webhook not configured", { status: 500 })
    }

    const body = await req.text()
    const signature = headers().get("stripe-signature")

    if (!signature) {
        return new Response("Missing stripe-signature header", { status: 400 })
    }

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (error) {
        console.error("Stripe webhook signature verification failed")
        return new Response("Invalid signature", { status: 400 })
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session

        const { userId } = session.metadata || { userId: null }

        if (!userId) {
            return new Response("Invalid metadata", { status: 400 })
        }

        // Idempotent: only users not already on PRO are touched, so Stripe
        // retries / duplicate deliveries are harmless.
        await db.user.updateMany({
            where: { id: userId, plan: { not: "PRO" } },
            data: { plan: "PRO" },
        })
    }

    return new Response("OK")
}
