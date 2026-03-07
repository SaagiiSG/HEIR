import { z } from "zod";

export const addressSchema = z.object({
  firstName: z.string().min(1, "Нэр заавал бөглөнө үү"),
  lastName: z.string().min(1, "Овог заавал бөглөнө үү"),
  phone: z.string().min(8, "Утасны дугаар буруу байна"),
  email: z.string().email("И-мэйл буруу байна"),
  address1: z.string().min(1, "Хаяг заавал бөглөнө үү"),
  address2: z.string().optional(),
  city: z.string().min(1, "Хот/Аймаг заавал бөглөнө үү"),
  district: z.string().min(1, "Дүүрэг/Сум заавал бөглөнө үү"),
  postalCode: z.string().optional(),
  notes: z.string().optional(),
});

export type AddressFormData = z.infer<typeof addressSchema>;

export const checkoutSchema = z.object({
  phone: z.string().min(8, "Утасны дугаар буруу байна"),
  firstName: z.string().min(1, "Нэр заавал бөглөнө үү"),
  lastName: z.string().min(1, "Овог заавал бөглөнө үү"),
  address1: z.string().min(1, "Хаяг заавал бөглөнө үү"),
  district: z.string().min(1, "Дүүрэг/Сум заавал бөглөнө үү"),
  city: z.string().min(1, "Хот/Аймаг заавал бөглөнө үү"),
  postalCode: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

export const loginSchema = z.object({
  email: z.string().email("И-мэйл буруу байна"),
  password: z.string().min(6, "Нууц үг хэт богино байна"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z.string().min(1, "Нэр заавал бөглөнө үү"),
    lastName: z.string().min(1, "Овог заавал бөглөнө үү"),
    email: z.string().email("И-мэйл буруу байна"),
    password: z.string().min(8, "Нууц үг хамгийн багадаа 8 тэмдэгт байна"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Нууц үг таарахгүй байна",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("И-мэйл буруу байна"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
