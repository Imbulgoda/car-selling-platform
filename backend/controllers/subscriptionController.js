import subscription from "../models/subscriptionModel.js"

export const createSubscription = async (req, res) => {
    try {
        const { email } = req.body;

        //check email availability
        const user = await subscription.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: "Email already subscribed."
            })
        }
        //create subscription
        await subscription.create({ email });
        res.status(201).json({
            success: true,
            message: "Subscription successful."
        })
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Side Error."
        })
    }
}