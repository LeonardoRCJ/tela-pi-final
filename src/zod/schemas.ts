import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("Email deve ser válido."),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres."),
});


export const signUpSchema = z.object({
  email: z.email("Email deve ser válido."),
  name: z.string("Nome do usuário deve ser informado."),
  phone: z.string().length(11, "O telefone deve ser válido e com exatamente 11 caracteres."),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres.")
})