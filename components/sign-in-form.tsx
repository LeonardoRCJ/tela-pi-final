import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { Pressable, type TextInput, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema } from "@/src/zod/schemas";
import z from "zod";

type Props = {
  onSubmit: (email: string, password: string) => void;
};

type FormData = z.infer<typeof signInSchema>;

export function SignInForm({ onSubmit }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function handleFormSubmit(data: FormData) {
    onSubmit(data.email, data.password);
  }

  const passwordInputRef = React.useRef<TextInput>(null);
  const navigation = useNavigation();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  return (
    <View className="gap-6 mt-14">
      <Card className="border-border/0 sm:border-border shadow-none sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">
            Logue no aplicativo
          </CardTitle>
          <CardDescription className="text-center sm:text-left">
            Bem-vindo de volta! Logue para acessar o aplicativo.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            <View className="gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <Input
                    id="email"
                    placeholder="pessoa@exemplo.com"
                    keyboardType="email-address"
                    autoComplete="email"
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="none"
                    onSubmitEditing={onEmailSubmitEditing}
                    returnKeyType="next"
                    submitBehavior="submit"
                  />
                )}
              />

              {errors.email && (
                <Text className="color-red-400">{errors.email.message}</Text>
              )}
            </View>
            <View className="gap-1.5">
              <View className="flex-row items-center">
                <Label htmlFor="password">Senha</Label>
              </View>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <Input
                    ref={passwordInputRef}
                    id="password"
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry
                    returnKeyType="send"
                    onSubmitEditing={handleSubmit(handleFormSubmit)}
                  />
                )}
              />

              {errors.password && (
                <Text className="color-red-400">{errors.password.message}</Text>
              )}
            </View>
            <Button className="w-full" onPress={handleSubmit(handleFormSubmit)}>
              <Text>Entrar</Text>
            </Button>
          </View>
          <Text className="text-center text-sm">
            Não tem uma conta?{" "}
            <Pressable onPress={() => navigation.navigate("SignUp")}>
              <Text className="text-sm underline underline-offset-4">
                Registre-se
              </Text>
            </Pressable>
          </Text>
        </CardContent>
      </Card>
    </View>
  );
}
