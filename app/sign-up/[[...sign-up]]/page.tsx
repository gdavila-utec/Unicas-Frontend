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
            headerTitle: "text-2xl font-semibold text-center",
            headerSubtitle: "text-center text-gray-600 text-sm",
            socialButtonsProviderIcon: "hidden",
            dividerRow: "hidden",
            socialButtonsBlockButton: "hidden",
            formFieldInput: "rounded-md border-gray-200",
            footerActionText: "hidden",
            footerActionLink: "hidden",
            logoBox: "hidden",
            footer: "hidden",
            footerPages: "hidden",
            card: "relative",
            // Hide unnecessary fields
            alternativeMethodsBlockButton: "hidden",
            identityPreviewEditButton: "hidden",
            identityPreviewText: "hidden"
          },
          layout: {
            showOptionalFields: false,
            socialButtonsPlacement: "none",
            helpPageUrl: false,
            privacyPageUrl: false,
            termsPageUrl: false
          }
        }}
        localization={{
          signUp: {
            title: "Registrarse",
            subtitle: "para continuar a my app",
            emailAddressLabel: "Correo electrónico",
            passwordLabel: "Contraseña",
            firstName: "Nombre",
            lastName: "Apellido",
            continue: "Continuar"
          }
        }}
      />
      <div className="mt-4 text-sm text-gray-600">
        ¿Ya tienes una cuenta?{" "}
        <Link href="/sign-in" className="text-blue-600 hover:text-blue-700">
          Iniciar sesión
        </Link>
      </div>
    </div>
  );
}