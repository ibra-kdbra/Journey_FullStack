import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    apiVersion: "2025-02-24.acacia", // Update to the correct version
    typescript: true,
});


export const createCheckoutSession = async ({ userEmail, userId }: { userEmail: string, userId: string }) => {
    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price: "price_1R3IpxBr2ThCcKNRIDn8CoPR",
                quantity: 1
            }
        ],
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
        customer_email: userEmail,
        metadata: {
            userId
        }
    })

    return session
}