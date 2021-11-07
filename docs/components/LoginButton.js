import { useAuth0 } from '@auth0/auth0-react'

export const LoginButton = ({text}) => {
    const { loginWithRedirect } = useAuth0();
    return (
        <button
            onClick={() => loginWithRedirect({ connection: "github" })}
            className="w-64  flex items-center justify-center px-8 py-8 my-8 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
        >
                Get started
        </button>
    )
}