import {
    object, string, number,
    optional, pipe,
    minLength, transform, fallback, union,
    boolean
} from "valibot";

export const envSchema = object({
    API_BASE_PATH: pipe(
        string(),
        minLength(1, 'Debe proporcionar un endpoint para la ruta base de la api'),
    ),
    PORT: pipe(
        optional(union([string(), number()])),
        transform((val) => val === "" ? undefined : Number(val)),
        fallback(number(), 3025)
    ),
    DB_USER: pipe(
        string(),
        minLength(1, 'Debe proporcionar un usuario de base de datos'),
    ),
    DB_PASSWORD: pipe(
        string(),
        minLength(1, 'Debe proporcionar una contraseña de base de datos'),
    ),
    DB_NAME: pipe(
        string(),
        minLength(1, 'Debe proporcionar un nombre de base de datos'),
    ),
    DB_PORT: pipe(
        optional(union([string(), number()])),
        transform((val) => val === "" ? undefined : Number(val)),
        fallback(number(), 5432),
    ),
    DB_URL: pipe(
        string(),
        minLength(1, 'Debe proporcionar una URL de base de datos'),
    ),
    NODE_ENV: pipe(
        string(),
        minLength(1, 'Debe proporcionar el entorno de desarrollo'),
    ),
    LOG_LEVEL: pipe(
        string(),
        minLength(1, 'Debe proporcionar el nivel de log'),
    ),


    // Access Token
    ACCESTOKEN_MAXAGE: pipe(
        optional(union([string(), number()])),
        transform((val) => val === "" ? undefined : Number(val)),
        fallback(number(), 3600),  // ✅ 1 hora en segundos
    ),
    ACCESTOKEN_EXPIRATIONTIME: pipe(
        string(),
        minLength(1, 'Debe proporcionar un tiempo de expiración para el access token'),
    ),
    ACCESTOKEN_SECRETKEY: pipe(
        string(),
        minLength(1, 'Debe proporcionar una clave secreta para el access token'),
    ),

    // Refresh Token
    REFRESHTOKEN_MAXAGE: pipe(
        optional(union([string(), number()])),
        transform((val) => val === "" ? undefined : Number(val)),
        fallback(number(), 604800),  // ✅ 7 días en segundos
    ),
    REFRESHTOKEN_EXPIRATIONTIME: pipe(
        string(),
        minLength(1, 'Debe proporcionar un tiempo de expiración para el refresh token'),
    ),
    REFRESHTOKEN_SECRETKEY: pipe(
        string(),
        minLength(1, 'Debe proporcionar una clave secreta para el refresh token'),
    ),

    // User Data Cookie
    USERDATA_MAXAGE: pipe(
        optional(union([string(), number()])),
        transform((val) => val === "" ? undefined : Number(val)),
        fallback(number(), 604800),  // ✅ 7 días en segundos
    ),
    USERDATA_EXPIRATIONTIME: pipe(
        string(),
        minLength(1, 'Debe proporcionar un tiempo de expiración para el user data'),
    ),
    USERDATA_SECRETKEY: pipe(
        string(),
        minLength(1, 'Debe proporcionar una clave secreta para el user data'),
    )
});