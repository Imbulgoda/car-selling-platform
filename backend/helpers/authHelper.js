import bcrypt from "bcryptjs";

export const passwordHash = async (password) => {
    try {
        const saltRound = 10;
        const hashedPassword = bcrypt.hash(password, saltRound);
        return hashedPassword;

    } catch (error) {
        console.log(error)
    }
}

export const comparePassword = async (password, hashPassword) => {
    return bcrypt.compare(password, hashPassword);
}