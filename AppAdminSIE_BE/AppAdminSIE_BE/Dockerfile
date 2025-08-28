# Usa la imagen base de .NET 8.0 SDK para construir
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env
WORKDIR /app

# Copia todo el código fuente de la carpeta del proyecto
COPY . .

# Restaura las dependencias (ya estás en el directorio correcto)
RUN dotnet restore AppAdminSIE_BE.csproj

# Construye la aplicación
RUN dotnet publish AppAdminSIE_BE.csproj -c Release -o out

# Usa la imagen base de .NET 8.0 runtime para ejecutar
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build-env /app/out .

# Expone el puerto 10000 (requerido por Render)
EXPOSE 10000

# Comando para iniciar la aplicación
ENTRYPOINT ["dotnet", "AppAdminSIE_BE.dll"]
