import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12">
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary: 
              "bg-black-700 hover:bg-black-700 text-white px-3 py-2 rounded-md relative",
            formButtonIcon: "hidden",
            cardSimple: "shadow-xl rounded-3xl",
            headerTitle: {
              className: "text-2xl font-semibold text-center",
              children: "Registrarse"
            },
            headerSubtitle: {
              className: "text-center text-gray-600 text-sm",
              children: "para comenzar a usar my app"
            },
            socialButtonsProviderIcon: "hidden",
            dividerRow: "hidden",
            socialButtonsBlockButton: "hidden",
            formFieldInput: "rounded-md border-gray-200",
            formFieldLabel: {
              email: {
                children: "Correo electrónico"
              },
              password: {
                children: "Contraseña"
              },
              firstName: {
                children: "Nombre"
              },
              lastName: {
                children: "Apellido"
              }
            },
            footerActionText: "hidden",
            footerActionLink: "hidden",
            logoBox: "hidden",
            footer: "hidden",
            footerPages: "hidden",
            card: "relative",
            formButtonPrimaryContent: {
              children: "Continuar"
            }
          },
          layout: {
            showOptionalFields: false,
            socialButtonsPlacement: undefined
          }
        }}
      />
      <div className="mt-4 text-sm text-gray-600">
        ¿Ya tienes una cuenta?{" "}
        <Link href="/sign-in" className="text-blue-600 hover:text-blue-700">
          Inicia sesión
        </Link>
      </div>
    </div>
  );
}